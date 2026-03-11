import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.useDb('test');

        const userCollection = mongoose.connection.collection('users');
        const orgCollection = mongoose.connection.collection('organizations');

        const user = await userCollection.findOne({ email: 'techvaseegrah@gmail.com' });
        if (!user) {
            console.log("User not found!");
        } else {
            console.log("User found:", user.email, "Org ID:", user.orgId);
            const orgUpdate = await orgCollection.updateOne(
                { _id: user.orgId },
                {
                    $set: {
                        subscriptionPlan: 'premium',
                        subscriptionStatus: 'active',
                        subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
                    }
                }
            );
            console.log("Org update result:", orgUpdate);
        }
    } catch (e) {
        console.error("DEBUG ERR:", e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
connectDB();
