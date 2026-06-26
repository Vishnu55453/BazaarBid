const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    // Buyer who created auction (Kirana User only)
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Buyer type - must be kirana_user
    buyerType: {
        type: String,
        enum: ['kirana_user'],
        default: 'kirana_user'
    },

    // Items array (1 to 4 items)
    items: [{
        productName: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unit: {
            type: String,
            enum: ['kg', 'gram', 'litre', 'dozen', 'piece', 'box'],
            required: true
        },
        // Quality Specifications
        qualitySpecs: {
            grade: String,        // 'Premium', 'Standard', 'A', 'B'
            organic: { type: Boolean, default: false },
            freshness: String,    // 'Today', '1 day old', etc.
            packaging: String,    // 'Loose', 'Box', 'Bag'
            customRequirements: String
        },
        // Target Budget (Optional)
        budgetRange: {
            min: Number,  // per unit
            max: Number   // per unit
        },
        // Status tracking per item
        status: {
            type: String,
            enum: ['open', 'awarded', 'cancelled'],
            default: 'open'
        },
        winningBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
        awardedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    // Bidding Mode
    allowPartialBids: {
        type: Boolean,
        default: false // if true, sellers can bid on specific items
    },

    // Delivery Preferences
    preferredMarket: {
        type: String,
        required: true
    },
    deliveryAddress: {
        shopName: String,
        area: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        landmark: String,
        fullAddress: String
    },
    deliveryTimeline: {
        type: Number,
        required: true,
        min: 1
    },
    expectedDeliveryDate: Date,


    // Payment Terms (Percentage of advance payment)
    advancePercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0 // 0 means 100% Cash On Delivery
    },

    // Auction Settings
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: true
    },
    autoAward: {
        type: Boolean,
        default: true  // Automatically award to lowest bidder
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'open', 'closed', 'awarded', 'cancelled', 'expired', 'completed'],
        default: 'draft'
    },

    // Rating Requirements
    minRatingRequired: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 5 
    },
    verifiedSellersOnly: {
        type: Boolean,
        default: false
    },

    // Bids Summary
    totalBids: { type: Number, default: 0 },
    lowestBid: Number,
    highestBid: Number,
    averageBid: Number,

    // Winner Details
    winningBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    winningSellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    winningPrice: Number,
    winningPricePerUnit: Number,
    awardedAt: Date,

    // Order after auction
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    // Metadata
    views: { type: Number, default: 0 },
    lastBidAt: Date,
    notificationsSent: {
        toSellers: { type: Boolean, default: false },
        toBuyer: { type: Boolean, default: false }
    }

}, { timestamps: true });

// Indexes for queries
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ buyerId: 1, status: 1 });
auctionSchema.index({ category: 1, preferredMarket: 1 });
auctionSchema.index({ 'deliveryAddress.pincode': 1 });
auctionSchema.index({ status: 1, endTime: 1, 'budgetRange.max': 1 });

// Virtual for time remaining
auctionSchema.virtual('timeRemaining').get(function () {
    if (this.status !== 'open') return 0;
    const remaining = this.endTime - new Date();
    return Math.max(0, remaining);
});

// Virtual for time remaining in hours
auctionSchema.virtual('timeRemainingHours').get(function () {
    const ms = this.timeRemaining;
    return Math.floor(ms / (1000 * 60 * 60));
});

// Check if auction is expired
auctionSchema.methods.isExpired = function () {
    return this.status === 'open' && new Date() > this.endTime;
};

// Auto-expire auction on save
auctionSchema.pre('save', function () {
    if (this.status === 'open' && new Date() > this.endTime) {
        this.status = 'expired';
    }
});

module.exports = mongoose.model('Auction', auctionSchema);