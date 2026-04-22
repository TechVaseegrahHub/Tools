import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Organization from './models/organization.model.js';
dotenv.config();

const linkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const user = await User.findOne({ email: 'techvaseegrah@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        const org = await Organization.findOne({ slug: 'tools' });
        if (!org) {
            console.log('Organization "tools" not found');
            process.exit(1);
        }

        user.orgId = org._id;
        await user.save();
        
        console.log(`✅ Linked user ${user.email} to organization ${org.name}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

linkUser();
