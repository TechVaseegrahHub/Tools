import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Organization from './models/organization.model.js';
dotenv.config();

const checkOrgs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const orgs = await Organization.find();
        console.log(`Found ${orgs.length} organizations:`);
        orgs.forEach(o => console.log(`- ${o.name} (${o.slug}) : ${o._id}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOrgs();
