import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

console.log('Testing login functionality...');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('Successfully connected to MongoDB.');
  
  const userEmail = 'techvaseegrah@gmail.com';
  const testPassword = 'admin123'; // Try this password
  
  console.log(`\nAttempting login for: ${userEmail}`);
  console.log(`Testing password: ${testPassword}`);
  
  const user = await User.findOne({ email: userEmail });
  
  if (user) {
    console.log('\n✓ User found in database');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Hashed Password:', user.password);
    
    // Test password comparison
    console.log('\nTesting password comparison...');
    const isMatch = await user.comparePassword(testPassword);
    console.log(`Password match result: ${isMatch}`);
    
    if (isMatch) {
      console.log('✓ Password is correct!');
    } else {
      console.log('✗ Password does not match');
      
      // Try direct bcrypt comparison as well
      const directMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`Direct bcrypt comparison: ${directMatch}`);
      
      // Let's also test what the user might be entering
      console.log('\nTrying other common passwords:');
      const commonPasswords = ['password', '123456', 'admin', 'test123'];
      for (const pwd of commonPasswords) {
        const match = await user.comparePassword(pwd);
        if (match) {
          console.log(`✓ Password "${pwd}" matches!`);
        }
      }
    }
  } else {
    console.log('✗ User not found');
  }
  
  mongoose.connection.close();
})
.catch(err => {
  console.error('Database connection error:', err);
});
