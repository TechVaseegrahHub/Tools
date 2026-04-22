import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

try {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'test',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'test'
    });
    console.log('✅ Razorpay initialized');
    console.log('Instance methods:', Object.keys(instance));
} catch (err) {
    console.error('❌ Razorpay failed to initialize:', err.message);
}
