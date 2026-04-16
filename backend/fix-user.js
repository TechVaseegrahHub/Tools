import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

const fixUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Delete the potentially double-hashed user
    const result = await User.deleteOne({ email: 'techvaseegrah@gmail.com' });
    console.log('Deleted user count:', result.deletedCount);
    
    // Create it again (raw password '0000' will be hashed once by pre-save hook)
    const newUser = new User({
      name: 'Tech Vaseegrah',
      email: 'techvaseegrah@gmail.com',
      password: '0000',
      role: 'Admin'
    });
    
    await newUser.save();
    console.log('User recreated successfully with password 0000');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixUser();
