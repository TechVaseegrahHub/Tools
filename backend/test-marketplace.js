import mongoose from 'mongoose';
import Tool from './models/tool.model.js';
import Category from './models/category.model.js';
import User from './models/user.model.js';
import Organization from './models/organization.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if we have an org and a user
    let org = await Organization.findOne();
    let user = await User.findOne();

    if (!org || !user) {
        console.log("MISSING_DATA: Need at least one org and one user.");
        process.exit(0);
    }

    let cat = await Category.findOne({ orgId: org._id });
    if (!cat) {
        cat = await Category.create({ name: 'DiagnosticTools', orgId: org._id });
    }

    console.log("Creating test rentable tool...");
    const tool = await Tool.create({
        toolName: 'Diagnostic Hammer',
        toolId: 'DH-001',
        category: cat._id,
        status: 'Available',
        orgId: org._id,
        ownerId: user._id,
        isRentable: true,
        price_per_hour: 10,
        description: 'A tool for testing the marketplace.'
    });

    console.log("CREATED:", tool._id);

    const filter = { isRentable: true };
    const tools = await Tool.find(filter)
      .populate('category', 'name')
      .populate('ownerId', 'name email')
      .lean();

    console.log('SUCCESS! Found tools:', tools.length);
    console.log('Sample tool category:', tools[0].category?.name);
    console.log('Sample tool owner:', tools[0].ownerId?.name);

    process.exit(0);
  } catch (err) {
    console.error('FAILED:');
    console.error(err);
    process.exit(1);
  }
};

test();
