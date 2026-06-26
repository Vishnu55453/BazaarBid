const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
    createAuction,
    getOpenAuctions,
    getAuctionById,
    getMyAuctions,
    cancelAuction,
    awardAuctionManual,
    autoCloseExpiredAuctions
} = require('../controllers/auctionController');

// Validation rules
const auctionValidation = [
    body('items').isArray({ min: 1, max: 4 }).withMessage('At least 1 and up to 4 items are required'),
    body('items.*.productName').notEmpty().withMessage('Product name is required for all items'),
    body('items.*.category').notEmpty().withMessage('Category is required for all items'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1 for all items'),
    body('items.*.unit').isIn(['kg', 'gram', 'litre', 'dozen', 'piece', 'box']).withMessage('Invalid unit in items'),
    body('deliveryTimeline').isInt({ min: 1 }).withMessage('Delivery timeline must be at least 1 day'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
    body('advancePercent').optional().isInt({ min: 0, max: 100 }).withMessage('Advance percentage must be between 0 and 100')
];

// Kirana User only - Create auction
router.post(
    '/',
    authMiddleware,
    roleMiddleware('kirana_user'),
    auctionValidation,
    createAuction
);

// Big Market Sellers - View open auctions
router.get('/open', authMiddleware, roleMiddleware('big_market_seller'), getOpenAuctions);

// Kirana User - Get my auctions  ← MUST be before /:id to avoid route conflict
router.get('/my/auctions', authMiddleware, roleMiddleware('kirana_user'), getMyAuctions);

// Get auction by ID (both buyer and sellers)
router.get('/:id', authMiddleware, getAuctionById);

// Kirana User - Cancel auction
router.put('/:id/cancel', authMiddleware, roleMiddleware('kirana_user'), cancelAuction);

// Kirana User - Award auction manually
router.put('/:id/award/:bidId', authMiddleware, roleMiddleware('kirana_user'), awardAuctionManual);

// Admin - Auto close expired auctions (cron job)
router.post('/auto-close', authMiddleware, roleMiddleware('admin'), autoCloseExpiredAuctions);

module.exports = router;