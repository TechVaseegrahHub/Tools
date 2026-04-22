import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Organization from './models/organization.model.js';
dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'techvaseegrah@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(0);
        }
        console.log('User:', {
            id: user._id,
            email: user.email,
            role: user.role,
            orgId: user.orgId
        });

        if (user.orgId) {
            const org = await Organization.findById(user.orgId);
            console.log('Org:', org ? { id: org._id, name: org.name } : 'Not found');
        } else {
            console.log('User has no orgId');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkUser();
