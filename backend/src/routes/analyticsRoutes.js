const express = require('express');
const router = express.Router();
const { getSellerAnalytics, getRetailerAnalytics } = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/seller', authMiddleware, getSellerAnalytics);
router.get('/retailer', authMiddleware, getRetailerAnalytics);

module.exports = router;
