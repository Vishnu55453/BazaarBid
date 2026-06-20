const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['bid_placed', 'outbid', 'auction_won', 'auction_expired',
            'order_confirmed', 'order_shipped', 'order_delivered',
            'payment_received', 'new_auction', 'system_alert'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed, // Additional data like auctionId, orderId
    isRead: { type: Boolean, default: false },
    readAt: Date,
    sentVia: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false }
    },
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);