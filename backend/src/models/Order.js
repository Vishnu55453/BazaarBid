const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    
    // Order Type
    orderType: {
        type: String,
        enum: ['direct', 'auction_won'],
        required: true
    },
    
    // Participants
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerRole: {
        type: String,
        enum: ['normal_buyer', 'kirana_user'],
        required: true
    },
    
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerRole: {
        type: String,
        enum: ['kirana_user', 'big_market_seller'],
        required: true
    },
    
    // For auction orders
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
    bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    
    // Order Items
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: String,
        quantity: Number,
        unit: String,
        pricePerUnit: Number,
        totalPrice: Number,
        // For resale tracking (kirana selling big market products)
        originalProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        originalPurchasePrice: Number
    }],
    
    // Pricing
    subtotal: { type: Number, required: true },
    deliveryCharges: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    // Payment
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cod', 'bank_transfer', 'wallet']
    },
    paymentId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    
    // Delivery
    deliveryAddress: {
        recipientName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        area: String,
        city: String,
        pincode: { type: String, required: true },
        landmark: String,
        latitude: Number,
        longitude: Number
    },
    deliveryTimeline: Number, // in days
    deliveryDate: Date,
    
    // Order Status
    status: {
        type: String,
        enum: [
            'pending',           // Order placed, waiting for confirmation
            'confirmed',         // Seller confirmed
            'processing',        // Being packed
            'shipped',           // Dispatched
            'out_for_delivery',  // With delivery partner
            'delivered',         // Received by buyer
            'cancelled',         // Cancelled
            'refunded'           // Refunded
        ],
        default: 'pending'
    },
    
    // Timeline
    orderDate: { type: Date, default: Date.now },
    confirmedAt: Date,
    processedAt: Date,
    shippedAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    
    cancellationReason: String,
    cancelledBy: { type: String, enum: ['buyer', 'seller', 'admin'] },
    
    // Rating & Review (after delivery)
    buyerRating: {
        score: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: Date
    },
    buyerRated: { type: Boolean, default: false },
    
    sellerRating: {
        score: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: Date
    },
    sellerRated: { type: Boolean, default: false },
    
    // Platform earnings
    platformEarnings: { type: Number, default: 0 },
    sellerEarnings: { type: Number, default: 0 },
    
    // Additional info
    notes: String,
    trackingId: String,
    trackingUrl: String
    
}, { timestamps: true });

// Generate order number before save
orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(6, '0')}`;
    }
});

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
    const diff = Date.now() - this.orderDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Indexes
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: 1 });
orderSchema.index({ auctionId: 1 });

// Methods
orderSchema.methods.updateStatus = function(newStatus, notes) {
    const statusTimestamps = {
        confirmed: 'confirmedAt',
        processing: 'processedAt',
        shipped: 'shippedAt',
        out_for_delivery: 'outForDeliveryAt',
        delivered: 'deliveredAt',
        cancelled: 'cancelledAt'
    };
    
    this.status = newStatus;
    if (statusTimestamps[newStatus]) {
        this[statusTimestamps[newStatus]] = new Date();
    }
    if (notes) this.notes = notes;
    
    return this.save();
};

orderSchema.methods.cancel = async function(reason, cancelledBy = 'buyer') {
    if (this.status === 'delivered') {
        throw new Error('Cannot cancel delivered order');
    }
    
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
    this.cancelledBy = cancelledBy;
    
    // If payment was made, initiate refund
    if (this.paymentStatus === 'paid') {
        this.paymentStatus = 'refunded';
        // TODO: Call refund API
    }
    
    return this.save();
};

module.exports = mongoose.model('Order', orderSchema);