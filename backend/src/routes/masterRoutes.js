const express = require('express');
const router = express.Router();
const { getMarkets, getCategories } = require('../controllers/masterController');

router.get('/markets', getMarkets);
router.get('/categories', getCategories);

module.exports = router;
