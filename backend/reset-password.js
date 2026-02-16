import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('=== User Password Reset Tool ===\n');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✓ Connected to MongoDB\n');

        // Show all users
        const users = await User.find({}, 'name email role');
        console.log('Available users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
        });

        console.log('\n');
        const email = await question('Enter user email to reset password: ');
        const newPassword = await question('Enter new password: ');

        const user = await User.findOne({ email: email.trim() });

        if (!user) {
            console.log('✗ User not found');
        } else {
            // Update password - the pre-save hook will hash it automatically
            user.password = newPassword;
            await user.save();

            console.log('\n✓ Password updated successfully!');
            console.log(`You can now login with:`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${newPassword}`);
        }

        rl.close();
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Database connection error:', err);
        rl.close();
    });
