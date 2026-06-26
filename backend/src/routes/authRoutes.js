const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    getSellers,
    getNearbyKirana,        // ADD THIS
    getBigMarketSellers     // ADD THIS
} = require('../controllers/authController');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Validation Rules - UPDATED with new roles
const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').customSanitizer(val => val ? val.replace(/\D/g, '') : '').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    // UPDATED: New roles
    body('role').isIn(['normal_buyer', 'kirana_user', 'big_market_seller', 'delivery_partner']).withMessage('Invalid role')
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Public Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected Routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidation, changePassword);
router.get('/sellers', authMiddleware, getSellers);

// NEW: Role-specific seller endpoints
router.get('/nearby-kirana', authMiddleware, getNearbyKirana);
router.get('/big-market-sellers', authMiddleware, getBigMarketSellers);

// Admin-only Routes
router.get('/users', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const users = await User.find().select('-password').limit(100);
    res.json({ success: true, users });
});

module.exports = router;