require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const seedAdminAndVerifyUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbid');
        console.log('MongoDB connected.');

        // 1. Verify all existing users
        const updated = await User.updateMany({}, { $set: { isVerified: true } });
        console.log(`Verified ${updated.modifiedCount} existing users.`);

        // 2. Create Admin user if not exists
        const adminEmail = 'admin@bazaarbid.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const admin = new User({
                name: 'System Admin',
                email: adminEmail,
                phone: '9999999999',
                password: 'admin123', // Will be hashed by pre-save hook
                role: 'admin',
                isVerified: true,
                isActive: true
            });
            await admin.save();
            console.log('Admin user seeded successfully. (admin@bazaarbid.com / admin123)');
        } else {
            console.log('Admin user already exists.');
        }

        console.log('Script completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
};

seedAdminAndVerifyUsers();
