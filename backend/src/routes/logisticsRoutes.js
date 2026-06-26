const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const { authMiddleware } = require('../middleware/auth');

// Apply protection to all routes
router.use(authMiddleware);

// Driver routes
router.route('/vehicles')
    .post(logisticsController.addVehicle)
    .get(logisticsController.getMyVehicles);

router.route('/vehicles/:id')
    .delete(logisticsController.deleteVehicle);

// Seller routes
router.get('/directory', logisticsController.getDirectory);

module.exports = router;
