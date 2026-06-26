const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { placeBid, getMyBids } = require('../controllers/bidController');

// Validation rules
const bidValidation = [
    body('bidItems').isArray({ min: 1 }).withMessage('At least one bid item is required'),
    body('bidItems.*.itemId').notEmpty().withMessage('Item ID is required for each bid item'),
    body('bidItems.*.pricePerUnit').isNumeric().withMessage('Price per unit must be a number for each item'),
    body('deliveryTimeline').isInt({ min: 1 }).withMessage('Delivery timeline must be at least 1 day'),
    body('advancePercentRequired').optional().isInt({ min: 0, max: 100 }).withMessage('Advance percentage must be between 0 and 100')
];

// @route   GET /api/bids/my-bids
// @desc    Get bids placed by the current seller
// @access  Private (Big Market Seller)
router.get(
    '/my-bids',
    authMiddleware,
    roleMiddleware('big_market_seller'),
    getMyBids
);

// @route   POST /api/bids/:auctionId
// @desc    Place a bid on an auction
// @access  Private (Big Market Seller)
router.post(
    '/:auctionId',
    authMiddleware,
    roleMiddleware('big_market_seller'),
    bidValidation,
    placeBid
);

module.exports = router;
