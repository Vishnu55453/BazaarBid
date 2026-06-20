const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Confirm order with COD
// @route   POST /api/payments/confirm-cod
// @access  Private (Buyer)
const confirmCODOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this order
        if (order.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if order is already processed
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order already processed' });
        }

        // Update order for COD
        order.paymentMethod = 'cod';
        order.paymentStatus = 'pending'; // Will be paid on delivery
        order.status = 'confirmed';
        order.confirmedAt = new Date();

        await order.save();

        // Update seller stats (order confirmed)
        await User.findByIdAndUpdate(order.sellerId, {
            $inc: { totalOrders: 1 }
        });

        res.json({
            success: true,
            message: 'Order confirmed successfully. Pay on delivery.',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                paymentMethod: 'cod',
                status: order.status,
                deliveryDate: order.deliveryDate
            }
        });

    } catch (error) {
        console.error('Confirm COD order error:', error);
        res.status(500).json({
            message: 'Failed to confirm order',
            error: error.message
        });
    }
};

// @desc    Mark COD order as paid (by delivery person/admin)
// @route   PUT /api/payments/mark-paid/:orderId
// @access  Private (Admin/Delivery only)
const markCODAsPaid = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { collectedBy, notes } = req.body;

        // Only admin or delivery person can mark as paid
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can mark COD as paid' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Order must be delivered first' });
        }

        // Check if already paid
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Order already marked as paid' });
        }

        // Mark as paid
        order.paymentStatus = 'paid';
        order.notes = notes || `COD payment collected by: ${collectedBy || req.user.name}`;

        // Add to seller's wallet balance
        await User.findByIdAndUpdate(order.sellerId, {
            $inc: { walletBalance: order.sellerEarnings }
        });

        await order.save();

        res.json({
            success: true,
            message: 'COD payment marked as received',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
                sellerEarnings: order.sellerEarnings
            }
        });

    } catch (error) {
        console.error('Mark COD paid error:', error);
        res.status(500).json({
            message: 'Failed to mark payment',
            error: error.message
        });
    }
};

// @desc    Get payment status for an order
// @route   GET /api/payments/status/:orderId
// @access  Private (Buyer)
const getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check ownership
        if (order.buyerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            success: true,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            orderStatus: order.status,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            message: order.paymentStatus === 'paid' ?
                'Payment received' :
                'Pay on delivery'
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            message: 'Failed to get payment status',
            error: error.message
        });
    }
};

// @desc    Get COD collection report (Admin only)
// @route   GET /api/payments/cod-report
// @access  Private (Admin)
const getCODReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {
            paymentMethod: 'cod',
            status: 'delivered'
        };

        if (startDate && endDate) {
            filter.deliveredAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const codOrders = await Order.find(filter)
            .populate('buyerId', 'name phone location')
            .populate('sellerId', 'name')
            .sort({ deliveredAt: -1 });

        const totalCODCollected = codOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingCOD = codOrders.filter(o => o.paymentStatus !== 'paid').length;
        const collectedCOD = codOrders.filter(o => o.paymentStatus === 'paid').length;

        res.json({
            success: true,
            stats: {
                totalOrders: codOrders.length,
                totalAmount: totalCODCollected,
                pendingCollection: pendingCOD,
                collectedCount: collectedCOD,
                pendingCount: pendingCOD
            },
            orders: codOrders
        });

    } catch (error) {
        console.error('Get COD report error:', error);
        res.status(500).json({
            message: 'Failed to get COD report',
            error: error.message
        });
    }
};

module.exports = {
    confirmCODOrder,
    markCODAsPaid,
    getPaymentStatus,
    getCODReport
};