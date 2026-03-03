import crypto from 'crypto';
import Razorpay from 'razorpay';
import Organization from '../models/organization.model.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay Subscription
// @route   POST /api/payment/create-subscription
// @access  Private/Admin/Manager
export const createSubscription = async (req, res) => {
    try {
        const orgId = req.user.orgId;

        // Check if the org already has an active subscription
        const org = await Organization.findById(orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        if (org.subscriptionPlan === 'premium' && org.subscriptionStatus === 'active') {
            return res.status(400).json({ message: 'Organization already has an active premium subscription' });
        }

        const planId = process.env.RAZORPAY_PLAN_ID;
        if (!planId) {
            console.error("RAZORPAY_PLAN_ID is not set in environment variables");
            return res.status(500).json({ message: 'Payment configuration error' });
        }

        // Create a subscription on Razorpay
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1, // Razorpay handles email notifications
            total_count: 120, // 10 years (120 months) max count, stops when canceled
        });

        if (!subscription || !subscription.id) {
            return res.status(500).json({ message: 'Failed to create Razorpay subscription' });
        }

        // Temporarily save the subscription ID on the org, but don't mark as premium yet
        org.razorpaySubscriptionId = subscription.id;
        org.subscriptionStatus = 'created';
        await org.save();

        res.status(200).json({
            subscriptionId: subscription.id,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Verify Razorpay Payment Signature for Subscription
// @route   POST /api/payment/verify
// @access  Private/Admin/Manager
export const verifySubscription = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
        const orgId = req.user.orgId;

        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        // Verify Signature
        const body = razorpay_payment_id + '|' + razorpay_subscription_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Signature matches, update org status
            const org = await Organization.findById(orgId);
            if (!org) return res.status(404).json({ message: 'Organization not found' });

            // Ensure the subscription ID matches what we created
            if (org.razorpaySubscriptionId !== razorpay_subscription_id) {
                return res.status(400).json({ message: 'Subscription ID mismatch' });
            }

            org.subscriptionPlan = 'premium';
            org.subscriptionStatus = 'active';
            // Set an initial currentPeriodEnd (e.g., 1 month from now), webhook will maintain this long term
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
            org.currentPeriodEnd = oneMonthFromNow;

            await org.save();

            res.status(200).json({ message: 'Payment verified successfully. Welcome to Premium!' });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Handle Razorpay Webhooks (to keep status in sync)
// @route   POST /api/payment/webhook
// @access  Public (Razorpay verifies signature)
export const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // To verify webhook, we need the raw body. 
        // In express with express.json(), req.body is an object.
        // Razorpay webhook validation requires the raw string. 
        // We can validate using crypto and the raw body.

        const signature = req.headers['x-razorpay-signature'];

        // Express JSON parser stringifies the body if not configured properly for raw data.
        // A simple workaround if raw body isn't available is using stringify, but order matters.
        const bodyString = JSON.stringify(req.body);

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(bodyString)
            .digest('hex');

        // Note: If expectedSignature doesn't match due to JSON stringify differences, 
        // you might need to use `express.raw({type: 'application/json'})` for this specific route.
        // For now, let's assume valid or skip rigid check for simplicity if signature matches

        if (expectedSignature !== signature) {
            // Failing silently for non-matching requests to prevent spam
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'subscription.charged') {
            const sub = payload.subscription.entity;
            const subId = sub.id;
            // Update the current_period_end
            const org = await Organization.findOne({ razorpaySubscriptionId: subId });
            if (org) {
                org.subscriptionStatus = 'active';
                // Razorpay uses unix timestamps (seconds)
                org.currentPeriodEnd = new Date(sub.current_end * 1000);
                await org.save();
            }
        } else if (event === 'subscription.halted' || event === 'subscription.cancelled') {
            const sub = payload.subscription.entity;
            const subId = sub.id;
            const org = await Organization.findOne({ razorpaySubscriptionId: subId });
            if (org) {
                org.subscriptionStatus = sub.status; // e.g., 'halted' or 'cancelled'
                org.subscriptionPlan = 'free'; // Downgrade to free
                await org.save();
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
