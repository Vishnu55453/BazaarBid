const Order = require('../models/Order');

// Helper: Get date X days ago
const getPastDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
};

// @desc    Get Seller Analytics (Big Market Seller)
// @route   GET /api/analytics/seller
// @access  Private
const getSellerAnalytics = async (req, res) => {
    try {
        const past7Days = getPastDate(7);

        // Fetch all delivered orders in the last 7 days
        const recentOrders = await Order.find({
            sellerId: req.user.id,
            status: 'delivered',
            deliveredAt: { $gte: past7Days }
        }).sort({ deliveredAt: 1 });

        // Aggregate daily revenue
        const revenueByDay = {};
        for (let i = 6; i >= 0; i--) {
            const dateStr = getPastDate(i).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            revenueByDay[dateStr] = 0;
        }

        recentOrders.forEach(order => {
            const dateStr = new Date(order.deliveredAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            if (revenueByDay[dateStr] !== undefined) {
                revenueByDay[dateStr] += (order.sellerEarnings || order.totalAmount);
            }
        });

        const chartData = Object.keys(revenueByDay).map(date => ({
            date,
            revenue: revenueByDay[date]
        }));

        res.json({
            success: true,
            chartData,
            totalOrdersLast7Days: recentOrders.length,
            totalRevenueLast7Days: recentOrders.reduce((sum, o) => sum + (o.sellerEarnings || o.totalAmount), 0)
        });

    } catch (error) {
        console.error('Seller Analytics Error:', error);
        res.status(500).json({ message: 'Failed to load analytics', error: error.message });
    }
};

// @desc    Get Retailer Analytics (Kirana User)
// @route   GET /api/analytics/retailer
// @access  Private
const getRetailerAnalytics = async (req, res) => {
    try {
        const past7Days = getPastDate(7);

        // Retailer as BUYER (Sourcing costs via auctions)
        const sourcingOrders = await Order.find({
            buyerId: req.user.id,
            orderType: 'auction_won',
            status: 'delivered',
            deliveredAt: { $gte: past7Days }
        });

        // Retailer as SELLER (Sales revenue via direct B2C)
        const retailSales = await Order.find({
            sellerId: req.user.id,
            orderType: 'direct',
            status: 'delivered',
            deliveredAt: { $gte: past7Days }
        });

        // Aggregate by day
        const dataByDay = {};
        for (let i = 6; i >= 0; i--) {
            const dateStr = getPastDate(i).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            dataByDay[dateStr] = { date: dateStr, sourcingCost: 0, salesRevenue: 0 };
        }

        sourcingOrders.forEach(order => {
            const dateStr = new Date(order.deliveredAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            if (dataByDay[dateStr]) dataByDay[dateStr].sourcingCost += order.totalAmount;
        });

        retailSales.forEach(order => {
            const dateStr = new Date(order.deliveredAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            if (dataByDay[dateStr]) dataByDay[dateStr].salesRevenue += (order.sellerEarnings || order.totalAmount);
        });

        const chartData = Object.values(dataByDay);

        res.json({
            success: true,
            chartData,
            totalSourcingCost: sourcingOrders.reduce((sum, o) => sum + o.totalAmount, 0),
            totalSalesRevenue: retailSales.reduce((sum, o) => sum + (o.sellerEarnings || o.totalAmount), 0)
        });

    } catch (error) {
        console.error('Retailer Analytics Error:', error);
        res.status(500).json({ message: 'Failed to load analytics', error: error.message });
    }
};

module.exports = {
    getSellerAnalytics,
    getRetailerAnalytics
};
