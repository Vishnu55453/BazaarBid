const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
    createDirectOrder,
    getMyOrders,
    getSellerOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    addRating,
    getUserReviews
} = require('../controllers/orderController');

// Validation rules
const orderValidation = [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('deliveryAddress.pincode').isLength({ min: 6, max: 6 }).withMessage('Valid pincode required'),
    body('paymentMethod').isIn(['cod', 'razorpay']).withMessage('Invalid payment method')
];

const ratingValidation = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5')
];

// Normal Buyer - Create direct order
router.post(
    '/direct',
    authMiddleware,
    roleMiddleware('normal_buyer'),
    orderValidation,
    createDirectOrder
);

// Get my orders (as buyer)
router.get('/my-orders', authMiddleware, getMyOrders);

// Get seller orders (Kirana or Big Market Seller)
router.get('/seller-orders', authMiddleware, roleMiddleware('kirana_user', 'big_market_seller'), getSellerOrders);

// Get order by ID
router.get('/:id', authMiddleware, getOrderById);

// Seller - Update order status
router.put('/:id/status', authMiddleware, updateOrderStatus);

// Buyer - Cancel order
router.put('/:id/cancel', authMiddleware, cancelOrder);

// Buyer/Seller - Add rating
router.post('/:id/rate', authMiddleware, ratingValidation, addRating);

// Public - Get user reviews
router.get('/users/:userId/reviews', getUserReviews);

module.exports = router;