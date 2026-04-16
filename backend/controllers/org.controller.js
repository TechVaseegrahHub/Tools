import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();
import Organization from '../models/organization.model.js';
import User from '../models/user.model.js';

let razorpay;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    } else {
        console.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env. Razorpay features in org controller may fail.');
    }
} catch (error) {
    console.error('Failed to initialize Razorpay in org controller:', error.message);
}

// @desc    Get this org's settings (includes subscription info)
// @route   GET /api/org/settings
// @access  Private/Admin
export const getOrgSettings = async (req, res) => {
    try {
        const org = await Organization.findById(req.user.orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });
        res.json({
            _id: org._id,
            name: org.name,
            slug: org.slug,
            isActive: org.isActive,
            createdAt: org.createdAt,
            subscriptionPlan: org.subscriptionPlan,
            subscriptionStatus: org.subscriptionStatus,
            startDate: org.startDate,
            endDate: org.endDate,
            currentPeriodEnd: org.currentPeriodEnd,
            razorpaySubscriptionId: org.razorpaySubscriptionId,
        });
    } catch (error) {
        console.error('getOrgSettings error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update org name
// @route   PUT /api/org/settings
// @access  Private/Admin
export const updateOrgSettings = async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Organization name is required' });

    try {
        const org = await Organization.findById(req.user.orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        // Regenerate slug from new name
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slugExists = await Organization.findOne({ slug, _id: { $ne: org._id } });
        if (slugExists) return res.status(400).json({ message: 'An org with a similar name already exists' });

        org.name = name.trim();
        org.slug = slug;
        await org.save();

        res.json({ message: 'Organization updated successfully', org: { name: org.name, slug: org.slug } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Cancel the org's Razorpay subscription
// @route   DELETE /api/org/subscription
// @access  Private/Admin
export const cancelSubscription = async (req, res) => {
    try {
        const org = await Organization.findById(req.user.orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        if (!['Basic', 'Pro', 'premium', 'free_premium'].includes(org.subscriptionPlan)) {
            return res.status(400).json({ message: 'No active premium subscription to cancel' });
        }

        // Cancel at cycle end so the user keeps access until the period ends
        if (org.razorpaySubscriptionId && !org.razorpaySubscriptionId.startsWith('sub_mock_')) {
            try {
                await razorpay.subscriptions.cancel(org.razorpaySubscriptionId, { cancel_at_cycle_end: 1 });
            } catch (rzpErr) {
                console.warn('Razorpay cancel failed (may already be cancelled):', rzpErr.message);
            }
        }

        org.subscriptionPlan = 'Free';
        org.subscriptionStatus = 'cancelled';
        await org.save();

        res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
