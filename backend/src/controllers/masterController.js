const MarketMaster = require('../models/MarketMaster');
const CategoryMaster = require('../models/CategoryMaster');

// @desc    Get all active markets
// @route   GET /api/masters/markets
// @access  Public
const getMarkets = async (req, res) => {
    try {
        const markets = await MarketMaster.find({ isActive: true }).sort({ name: 1 });
        res.json(markets);
    } catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all active categories
// @route   GET /api/masters/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await CategoryMaster.find({ isActive: true }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMarkets,
    getCategories
};
