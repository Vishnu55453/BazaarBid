const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { submitReport, resolveReport } = require('../controllers/reportController');

// Submit report (Any authenticated user)
router.post('/', authMiddleware, submitReport);

// Admin resolves report
router.put('/:id/resolve', authMiddleware, roleMiddleware('admin'), resolveReport);

module.exports = router;
