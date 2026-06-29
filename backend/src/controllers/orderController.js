const Order = require('../models/Order');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Import the service (not redeclare)
const { createAuctionOrder } = require('../services/orderService');
const { sendNotification } = require('../services/socketService');

// Helper function to calculate platform commission
const calculateCommission = (totalAmount, sellerRole) => {
    // SaaS Model: Transaction fees are completely eliminated!
    // Platform revenue is now generated exclusively through Subscription Plans.
    return 0;
};

// @desc    Create direct order (Normal Buyer)
// @route   POST /api/orders/direct
// @access  Private (Normal Buyer)
const createDirectOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            items,
            deliveryAddress,
            notes
        } = req.body;

        // Check if user is normal buyer
        const buyer = await User.findById(req.user.id);
        if (!buyer || buyer.role !== 'normal_buyer') {
            return res.status(403).json({ message: 'Only normal buyers can place direct orders' });
        }

        // Validate items and calculate totals
        let subtotal = 0;
        const validatedItems = [];
        let sellerId = null;
        let seller = null;

        let maxDeliveryCharge = 0;
        let minFreeDeliveryAbove = Infinity;

        for (const item of items) {
            const product = await Product.findById(item.productId).populate('sellerId');
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }

            if (!product.isAvailable) {
                return res.status(400).json({ message: `${product.name} is not available` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            // Check minimum order quantity
            if (item.quantity < product.minimumOrderQty) {
                return res.status(400).json({
                    message: `${product.name} requires minimum order of ${product.minimumOrderQty} ${product.unit}`
                });
            }

            // Ensure all items are from the same seller
            if (!sellerId) {
                sellerId = product.sellerId._id;
                seller = product.sellerId;
            } else if (sellerId.toString() !== product.sellerId._id.toString()) {
                return res.status(400).json({ message: 'All items must be from the same seller' });
            }

            // Calculate price (check bulk pricing)
            let pricePerUnit = product.pricePerUnit;
            if (product.bulkPricing && product.bulkPricing.length > 0) {
                const applicableTier = product.bulkPricing
                    .sort((a, b) => b.minQuantity - a.minQuantity)
                    .find(tier => item.quantity >= tier.minQuantity);

                if (applicableTier) {
                    pricePerUnit = applicableTier.pricePerUnit;
                }
            }

            const totalPrice = pricePerUnit * item.quantity;
            subtotal += totalPrice;

            if (product.deliveryCharges > maxDeliveryCharge) {
                maxDeliveryCharge = product.deliveryCharges;
            }
            if (product.freeDeliveryAbove && product.freeDeliveryAbove < minFreeDeliveryAbove) {
                minFreeDeliveryAbove = product.freeDeliveryAbove;
            }

            validatedItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                unit: product.unit,
                pricePerUnit: pricePerUnit,
                totalPrice: totalPrice,
                originalProductId: product.originalProductId || null,
                originalPurchasePrice: product.originalPurchasePrice || null
            });

            // Reduce stock
            product.stock -= item.quantity;
            product.totalSold += item.quantity;
            await product.save();

            // If this is a kirana selling product, accurately update their internal bought inventory ledger
            if (product.sellerType === 'kirana_user') {
                await User.findOneAndUpdate(
                    {
                        _id: product.sellerId,
                        'kiranaProfile.inventory.originalProductName': product.originalProductName || product.name
                    },
                    {
                        $inc: { 'kiranaProfile.inventory.$.stock': -item.quantity },
                        $set: { 'kiranaProfile.inventory.$.lastUpdated': new Date() }
                    }
                );
            }
        }

        if (!seller) {
            seller = await User.findById(sellerId);
        }

        // Calculate delivery charges based on product thresholds
        let deliveryCharges = 0;
        if (subtotal >= minFreeDeliveryAbove) {
            deliveryCharges = 0;
        } else {
            // Fallback to default if maxDeliveryCharge is 0 but minFreeDeliveryAbove is not met
            deliveryCharges = maxDeliveryCharge > 0 ? maxDeliveryCharge : (seller.sellerType === 'kirana_user' ? 20 : 50);
        }

        const platformCommission = calculateCommission(subtotal, seller.role);
        // Platform commission is deducted from seller earnings, not added to buyer's total
        const totalAmount = subtotal + deliveryCharges;

        // Calculate delivery date
        const deliveryDate = new Date();
        const deliveryTimeline = seller.sellerType === 'kirana_user' ? 1 : 2;
        deliveryDate.setDate(deliveryDate.getDate() + deliveryTimeline);

        // Create order with pending status (waiting for payment confirmation)
        const order = new Order({
            orderType: 'direct',
            buyerId: req.user.id,
            buyerRole: 'normal_buyer',
            sellerId: sellerId,
            sellerRole: seller.role,
            items: validatedItems,
            subtotal,
            deliveryCharges,
            platformCommission,
            discount: 0,
            tax: 0,
            totalAmount,
            // paymentMethod will be set when buyer confirms COD
            paymentStatus: 'pending',
            deliveryAddress: {
                recipientName: buyer.name,
                phone: buyer.phone,
                ...deliveryAddress
            },
            deliveryTimeline,
            deliveryDate,
            status: 'pending',  // Not confirmed until COD is selected
            notes: notes || '',
            platformEarnings: platformCommission,
            sellerEarnings: subtotal - platformCommission
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created. Please select payment method to confirm.',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                status: order.status,
                requiresPaymentConfirmation: true
            }
        });
    } catch (error) {
        console.error('Create direct order error:', error);
        res.status(500).json({
            message: 'Failed to create order',
            error: error.message
        });
    }
};

// @desc    Get my orders (as buyer)
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        const filter = { buyerId: req.user.id };
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .populate('sellerId', 'name role kiranaProfile.asSeller.shopName bigMarketProfile.shopName')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Order.countDocuments(filter);

        // Calculate order statistics
        const totalSpentResult = await Order.aggregate([
            { $match: { buyerId: req.user._id, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const stats = {
            totalOrders: await Order.countDocuments({ buyerId: req.user.id }),
            pendingOrders: await Order.countDocuments({ buyerId: req.user.id, status: 'pending' }),
            confirmedOrders: await Order.countDocuments({ buyerId: req.user.id, status: 'confirmed' }),
            deliveredOrders: await Order.countDocuments({ buyerId: req.user.id, status: 'delivered' }),
            totalSpent: totalSpentResult[0]?.total || 0
        };

        res.json({
            success: true,
            stats,
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// @desc    Get orders for seller dashboard
// @route   GET /api/orders/seller-orders
// @access  Private (Kirana User or Big Market Seller)
const getSellerOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        const filter = { sellerId: req.user.id };
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .populate('buyerId', 'name phone location')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Order.countDocuments(filter);

        // Calculate seller statistics
        const totalEarningsResult = await Order.aggregate([
            { $match: { sellerId: req.user._id, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$sellerEarnings' } } }
        ]);

        const stats = {
            totalOrders: await Order.countDocuments({ sellerId: req.user.id }),
            pendingOrders: await Order.countDocuments({ sellerId: req.user.id, status: 'pending' }),
            confirmedOrders: await Order.countDocuments({ sellerId: req.user.id, status: 'confirmed' }),
            completedOrders: await Order.countDocuments({ sellerId: req.user.id, status: 'delivered' }),
            totalEarnings: totalEarningsResult[0]?.total || 0
        };

        res.json({
            success: true,
            stats,
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({
            message: 'Failed to fetch seller orders',
            error: error.message
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Buyer or Seller)
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyerId', 'name phone email location kiranaProfile.asBuyer')
            .populate('sellerId', 'name phone email location role kiranaProfile.asSeller bigMarketProfile')
            .populate('auctionId', 'productName quantity unit')
            .populate('bidId', 'bidPrice pricePerUnit deliveryTimeline');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isBuyer = order.buyerId && order.buyerId._id.toString() === req.user.id;
        const isSeller = order.sellerId && order.sellerId._id.toString() === req.user.id;

        if (!isBuyer && !isSeller && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

// @desc    Update order status (Seller)
// @route   PUT /api/orders/:id/status
// @access  Private (Seller)
const updateOrderStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const validStatuses = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is the seller
        if (order.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        // Prevent invalid status transitions
        if (order.status === 'delivered') {
            return res.status(400).json({ message: 'Cannot update delivered order' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot update cancelled order' });
        }

        // Update status with timestamp
        const statusTimestamps = {
            confirmed: 'confirmedAt',
            processing: 'processedAt',
            shipped: 'shippedAt',
            out_for_delivery: 'outForDeliveryAt',
            delivered: 'deliveredAt'
        };

        order.status = status;
        if (statusTimestamps[status]) {
            order[statusTimestamps[status]] = new Date();
        }
        if (notes) order.notes = notes;

        await order.save();

        // Notify Buyer
        await sendNotification(order.buyerId, {
            type: 'system_alert',
            title: `Order Update`,
            message: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status.replace('_', ' ')}.`,
            data: { orderId: order._id }
        });

        // If delivered, update seller stats + populate kirana inventory
        if (status === 'delivered') {
            await User.findByIdAndUpdate(order.sellerId, {
                $inc: {
                    totalOrders: 1,
                    totalSales: order.totalAmount
                }
            });

            await User.findByIdAndUpdate(order.buyerId, {
                $inc: { totalSpent: order.totalAmount }
            });

            // ✅ If this is a kirana buyer receiving wholesale auction goods,
            //    auto-sync both their internal Bought Inventory and their retail Storefront listings!
            if (order.orderType === 'auction_won' && order.buyerRole === 'kirana_user' && order.items?.length > 0) {
                for (const item of order.items) {

                    // 1. Storefront Auto-Sync (The "Killer Feature")
                    let retailProduct = await Product.findOne({
                        sellerId: order.buyerId,
                        sellerType: 'kirana_user',
                        isResaleProduct: true,
                        originalProductName: item.productName
                    });

                    if (retailProduct) {
                        retailProduct.stock += item.quantity;
                        retailProduct.originalPurchasePrice = item.pricePerUnit;
                        await retailProduct.save();
                    } else {
                        retailProduct = new Product({
                            sellerId: order.buyerId,
                            sellerType: 'kirana_user',
                            name: item.productName,
                            originalProductName: item.productName,
                            category: 'grocery', // Default draft category
                            unit: item.unit || 'kg',
                            pricePerUnit: Math.ceil(item.pricePerUnit * 1.2), // Suggest 20% margin
                            stock: item.quantity,
                            isResaleProduct: true,
                            originalPurchasePrice: item.pricePerUnit,
                            sourceSellerId: order.sellerId,
                            isAvailable: false // Hidden draft until retailer reviews and publishes
                        });
                        await retailProduct.save();
                    }

                    // 2. Internal Ledger Update
                    const alreadyInInventory = await User.findOne({
                        _id: order.buyerId,
                        'kiranaProfile.inventory.originalProductName': item.productName,
                        'kiranaProfile.inventory.sourceSellerId': order.sellerId
                    });

                    if (alreadyInInventory) {
                        await User.findOneAndUpdate(
                            {
                                _id: order.buyerId,
                                'kiranaProfile.inventory.originalProductName': item.productName,
                                'kiranaProfile.inventory.sourceSellerId': order.sellerId
                            },
                            {
                                $inc: { 'kiranaProfile.inventory.$.stock': item.quantity },
                                $set: {
                                    'kiranaProfile.inventory.$.lastUpdated': new Date(),
                                    'kiranaProfile.inventory.$.productId': retailProduct._id
                                }
                            }
                        );
                    } else {
                        await User.findByIdAndUpdate(order.buyerId, {
                            $push: {
                                'kiranaProfile.inventory': {
                                    productId: retailProduct._id,
                                    originalProductName: item.productName,
                                    category: null,
                                    purchasePrice: item.pricePerUnit,
                                    stock: item.quantity,
                                    unit: item.unit,
                                    sourceSellerId: order.sellerId,
                                    purchasedAt: new Date(),
                                    lastUpdated: new Date()
                                }
                            }
                        });
                    }
                }
                console.log(`🏪 Storefront and internal inventory auto-synced for kirana buyer ${order.buyerId}`);
            }
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

// @desc    Cancel order (Buyer)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Buyer)
const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isBuyer = order.buyerId.toString() === req.user.id;
        const isSeller = order.sellerId.toString() === req.user.id;

        if (!isBuyer && !isSeller && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Check if order can be cancelled
        if (order.status === 'delivered') {
            return res.status(400).json({ message: 'Cannot cancel delivered order' });
        }

        if (order.status === 'shipped' || order.status === 'out_for_delivery') {
            return res.status(400).json({ message: 'Order already shipped. Contact seller for return.' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order already cancelled' });
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason || (isSeller ? 'Cancelled/Rejected by seller' : 'Cancelled by customer');
        order.cancelledBy = isSeller ? 'seller' : 'buyer';
        await order.save();

        // Notify the other party
        const notifyUserId = isSeller ? order.buyerId : order.sellerId;
        await sendNotification(notifyUserId, {
            type: 'system_alert',
            title: 'Order Cancelled',
            message: `Order #${order._id.toString().slice(-6).toUpperCase()} was cancelled by the ${order.cancelledBy}.`,
            data: { orderId: order._id }
        });

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};

// @desc    Add rating and review
// @route   POST /api/orders/:id/rate
// @access  Private (Buyer or Seller)
const addRating = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Determine role of the user (Buyer or Seller)
        const isBuyer = order.buyerId.toString() === req.user.id;
        const isSeller = order.sellerId.toString() === req.user.id;

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ message: 'Not authorized to rate this order' });
        }

        // Check if order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Can only rate delivered orders' });
        }

        let targetUserId;

        if (isBuyer) {
            if (order.buyerRated) return res.status(400).json({ message: 'You have already rated this order' });

            order.buyerRating = { score: rating, review: review || '', createdAt: new Date() };
            order.buyerRated = true;
            targetUserId = order.sellerId;
        } else {
            if (order.sellerRated) return res.status(400).json({ message: 'You have already rated this order' });

            order.sellerRating = { score: rating, review: review || '', createdAt: new Date() };
            order.sellerRated = true;
            targetUserId = order.buyerId;
        }

        await order.save();

        // Recalculate target user's unified average rating
        // A user's rating is the average of ratings they received as a seller AND as a buyer
        const ordersAsSeller = await Order.find({ sellerId: targetUserId, buyerRated: true });
        const ordersAsBuyer = await Order.find({ buyerId: targetUserId, sellerRated: true });

        let totalScore = 0;
        let totalCount = 0;

        ordersAsSeller.forEach(o => { totalScore += o.buyerRating.score; totalCount++; });
        ordersAsBuyer.forEach(o => { totalScore += o.sellerRating.score; totalCount++; });

        const avgRating = totalCount > 0 ? (Math.round((totalScore / totalCount) * 10) / 10) : 0;

        await User.findByIdAndUpdate(targetUserId, {
            'rating.average': avgRating,
            'rating.count': totalCount
        });

        res.json({
            success: true,
            message: 'Rating added successfully',
            rating: isBuyer ? order.buyerRating : order.sellerRating
        });
    } catch (error) {
        console.error('Add rating error:', error);
        res.status(500).json({
            message: 'Failed to add rating',
            error: error.message
        });
    }
};

// @desc    Get all reviews for a user
// @route   GET /api/orders/users/:userId/reviews
// @access  Public
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch reviews where this user was the SELLER and buyer rated them
        const sellerReviews = await Order.find({ sellerId: userId, buyerRated: true })
            .populate('buyerId', 'name')
            .select('buyerRating orderDate');

        // Fetch reviews where this user was the BUYER and seller rated them
        const buyerReviews = await Order.find({ buyerId: userId, sellerRated: true })
            .populate('sellerId', 'name kiranaProfile.asSeller.shopName bigMarketProfile.shopName')
            .select('sellerRating orderDate');

        // Standardize format
        const formattedReviews = [
            ...sellerReviews.map(o => ({
                id: o._id,
                score: o.buyerRating.score,
                review: o.buyerRating.review,
                createdAt: o.buyerRating.createdAt || o.orderDate,
                reviewerName: o.buyerId?.name || 'Unknown User',
                roleContext: 'Sold to'
            })),
            ...buyerReviews.map(o => ({
                id: o._id,
                score: o.sellerRating.score,
                review: o.sellerRating.review,
                createdAt: o.sellerRating.createdAt || o.orderDate,
                reviewerName: o.sellerId?.kiranaProfile?.asSeller?.shopName || o.sellerId?.bigMarketProfile?.shopName || o.sellerId?.name || 'Unknown Seller',
                roleContext: 'Bought from'
            }))
        ];

        // Sort by newest first
        formattedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            count: formattedReviews.length,
            reviews: formattedReviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// Export the service function as well
module.exports = {
    createDirectOrder,
    createAuctionOrder,  // This comes from the service, re-exported
    getMyOrders,
    getSellerOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    addRating,
    getUserReviews
};