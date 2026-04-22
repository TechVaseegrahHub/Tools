import mongoose from 'mongoose';
import Organization from './models/organization.model.js';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Testing findById(undefined)...');
        const org = await Organization.findById(undefined);
        console.log('Result:', org);
        process.exit(0);
    } catch (err) {
        console.error('Caught Error:', err.name, '-', err.message);
        process.exit(0);
    }
};

test();
