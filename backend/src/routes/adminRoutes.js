const express = require('express');
const router = express.Router();
const { getPendingUsers, verifyUser } = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Protect all admin routes
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.route('/users/pending').get(getPendingUsers);
router.route('/users/:id/verify').put(verifyUser);

module.exports = router;
