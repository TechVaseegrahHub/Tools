import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

console.log('Creating test user...');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Not found');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('Successfully connected to MongoDB.');
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: 'techvaseegrah@gmail.com' });
  if (existingUser) {
    console.log('User already exists:');
    console.log('- ID:', existingUser._id);
    console.log('- Name:', existingUser.name);
    console.log('- Email:', existingUser.email);
    console.log('- Role:', existingUser.role);
    
    // Verify password
    const isMatch = await bcrypt.compare('0000', existingUser.password);
    if (isMatch) {
      console.log('Password is correct');
    } else {
      console.log('Password is incorrect');
    }
  } else {
    // Create the user
    console.log('Creating new user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('0000', salt);
    
    const user = new User({
      name: 'Tech Vaseegrah',
      email: 'techvaseegrah@gmail.com',
      password: hashedPassword,
      role: 'Admin'
    });
    
    try {
      const savedUser = await user.save();
      console.log('User created successfully:');
      console.log('- ID:', savedUser._id);
      console.log('- Name:', savedUser.name);
      console.log('- Email:', savedUser.email);
      console.log('- Role:', savedUser.role);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
  
  mongoose.connection.close();
})
.catch(err => {
  console.error('Database connection error:', err);
});