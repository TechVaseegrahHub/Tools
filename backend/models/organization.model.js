import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'premium', 'free_premium'],
        default: 'free'
    },
    razorpaySubscriptionId: {
        type: String,
        default: null
    },
    subscriptionStatus: {
        type: String,
        default: 'active'
    },
    currentPeriodEnd: {
        type: Date,
        default: null
    },
    paymentHistory: [
        {
            razorpayPaymentId: { type: String },
            amountPaise: { type: Number }, // amount in paise (₹1 = 100)
            paidAt: { type: Date, default: Date.now },
        }
    ],
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
