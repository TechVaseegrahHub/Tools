import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

console.log('Testing database connection and user lookup...');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Not found');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('Successfully connected to MongoDB.');
  
  // Look for the user with the email you provided
  const userEmail = 'techvaseegrah@gmail.com';
  console.log(`Searching for user with email: ${userEmail}`);
  
  const user = await User.findOne({ email: userEmail });
  if (user) {
    console.log('User found:');
    console.log('- ID:', user._id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Password (hashed):', user.password);
  } else {
    console.log('User not found in the database');
    
    // Let's see what users exist in the database
    const allUsers = await User.find({}, 'name email role');
    console.log('All users in database:');
    console.log(allUsers);
  }
  
  mongoose.connection.close();
})
.catch(err => {
  console.error('Database connection error:', err);
});