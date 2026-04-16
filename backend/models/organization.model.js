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
        enum: ['Free', 'Basic', 'Pro'],
        default: 'Free'
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending', 'created'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    // For backward compatibility and specialized tracking
    razorpaySubscriptionId: {
        type: String,
        default: null
    },
    currentPeriodEnd: { // Mapping this to endDate logic in controllers
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
