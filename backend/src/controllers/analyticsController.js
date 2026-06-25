const Order = require('../models/Order');
const Auction = require('../models/Auction');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// Helper to determine active plan features
const getUserPlanFeatures = async (userObjOrId) => {
    let user = userObjOrId;
    if (!user.subscription) {
        user = await User.findById(user._id || user.id || userObjOrId);
    }
    
    let planCode = user?.subscription?.planCode;
    if (!planCode) {
        planCode = user?.role === 'kirana_user' ? 'free_buyer' : 'free_seller';
    }
    const plan = await SubscriptionPlan.findOne({ planCode });
    return plan?.features || {};
};

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

// @desc    Get Price Trends (Premium Kirana User)
// @route   GET /api/analytics/price-trends
// @access  Private
const getPriceTrends = async (req, res) => {
    try {
        const features = await getUserPlanFeatures(req.user);
        if (!features.canViewAnalytics) {
            return res.status(403).json({
                message: 'Market Insights is a premium feature. Please upgrade your plan to view price trends.',
                requiresUpgrade: true
            });
        }

        const { category = 'vegetables' } = req.query;
        
        // Simple mock aggregation for demo purposes (real would aggregate winning bids)
        // Returning a 30-day trend curve
        const chartData = [];
        for (let i = 29; i >= 0; i -= 2) {
            const d = getPastDate(i);
            const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            // Generate a realistic-looking price curve
            const basePrice = category === 'fruits' ? 80 : 40;
            const fluctuation = Math.sin(i) * 5 + (Math.random() * 4 - 2);
            chartData.push({
                date: dateStr,
                averagePrice: Math.max(10, Math.round(basePrice + fluctuation))
            });
        }

        res.json({
            success: true,
            category,
            chartData
        });
    } catch (error) {
        console.error('Price Trends Error:', error);
        res.status(500).json({ message: 'Failed to load price trends', error: error.message });
    }
};

// @desc    Get Demand Heatmap (Premium Big Market Seller)
// @route   GET /api/analytics/demand-heatmap
// @access  Private
const getDemandHeatmap = async (req, res) => {
    try {
        const features = await getUserPlanFeatures(req.user);
        if (!features.canViewDemandHeatmaps) {
            return res.status(403).json({
                message: 'Demand Heatmaps is a premium feature. Please upgrade your plan to view it.',
                requiresUpgrade: true
            });
        }

        // Aggregate open auctions by city/area
        const heatmapData = await Auction.aggregate([
            { $match: { status: 'open' } },
            { 
                $group: { 
                    _id: "$deliveryAddress.city", 
                    activeAuctions: { $sum: 1 },
                    totalQuantityRequired: { $sum: { $sum: "$items.quantity" } }
                } 
            },
            { $sort: { activeAuctions: -1 } },
            { $limit: 10 }
        ]);

        const formattedData = heatmapData.map(item => ({
            location: item._id || 'Unknown',
            activeAuctions: item.activeAuctions,
            totalQuantityRequired: item.totalQuantityRequired
        }));

        res.json({
            success: true,
            heatmapData: formattedData
        });
    } catch (error) {
        console.error('Demand Heatmap Error:', error);
        res.status(500).json({ message: 'Failed to load demand heatmap', error: error.message });
    }
};

module.exports = {
    getSellerAnalytics,
    getRetailerAnalytics,
    getPriceTrends,
    getDemandHeatmap
};
