import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
    console.log('Testing connection to:', process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
};

testConnection();
