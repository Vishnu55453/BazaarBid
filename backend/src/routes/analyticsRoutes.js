const express = require('express');
const router = express.Router();
const { 
    getSellerAnalytics, 
    getRetailerAnalytics,
    getPriceTrends,
    getDemandHeatmap
} = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/seller', authMiddleware, getSellerAnalytics);
router.get('/retailer', authMiddleware, getRetailerAnalytics);
router.get('/price-trends', authMiddleware, getPriceTrends);
router.get('/demand-heatmap', authMiddleware, getDemandHeatmap);

module.exports = router;
