const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
    confirmCODOrder,
    markCODAsPaid,
    getPaymentStatus,
    getCODReport
} = require('../controllers/paymentController');

// Buyer routes
router.post('/confirm-cod', authMiddleware, confirmCODOrder);
router.get('/status/:orderId', authMiddleware, getPaymentStatus);

// Admin only routes
router.put('/mark-paid/:orderId', authMiddleware, roleMiddleware('admin'), markCODAsPaid);
router.get('/cod-report', authMiddleware, roleMiddleware('admin'), getCODReport);

module.exports = router;