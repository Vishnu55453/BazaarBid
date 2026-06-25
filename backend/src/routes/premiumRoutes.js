const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const premiumController = require('../controllers/premiumController');

// All routes require authentication
router.use(authMiddleware);

// Staff management routes
router.post('/staff', premiumController.addStaff);
router.get('/staff', premiumController.getStaff);
router.delete('/staff/:id', premiumController.removeStaff);

// Address management routes
router.post('/addresses', premiumController.addAddress);
router.put('/addresses/:id/default', premiumController.setDefaultAddress);
router.delete('/addresses/:id', premiumController.deleteAddress);

module.exports = router;
