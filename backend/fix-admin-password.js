import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

console.log('=== Resetting Admin Password ===\n');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✓ Connected to MongoDB\n');

        const adminEmail = 'techvaseegrah@gmail.com';
        const newPassword = 'admin123';

        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log('✗ Admin user not found');
        } else {
            console.log(`Found user: ${user.name} (${user.email})`);

            // Update password - the pre-save hook will hash it automatically
            user.password = newPassword;
            await user.save();

            console.log('\n✓ Password reset successfully!');
            console.log('\nLogin credentials:');
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${newPassword}`);
            console.log('\nYou can now login to the application.');
        }

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
