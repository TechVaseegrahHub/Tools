import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function main() {
    try {
        const plan = await razorpay.plans.create({
            period: 'monthly',
            interval: 1,
            item: {
                name: 'ToolRoom Premium - ₹99/month',
                amount: 9900, // 9900 paise = ₹99
                currency: 'INR',
                description: 'Premium Plan - ₹99/month'
            },
            notes: {
                purpose: 'testing'
            }
        });
        console.log('Created Plan ID:', plan.id);

        // Read .env file and replace the plan ID
        let envFile = fs.readFileSync('.env', 'utf-8');

        if (envFile.includes('RAZORPAY_PLAN_ID=')) {
            envFile = envFile.replace(/RAZORPAY_PLAN_ID=.*/g, `RAZORPAY_PLAN_ID=${plan.id}`);
        } else {
            envFile += `\nRAZORPAY_PLAN_ID=${plan.id}`;
        }

        fs.writeFileSync('.env', envFile);
        console.log('Updated .env with new plan ID.');
    } catch (err) {
        console.error('Failed to create plan:', err);
    }
}

main();
