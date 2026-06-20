const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    // Auction reference
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },

    // Seller who placed the bid (Big Market Seller only)
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Seller type - must be big_market_seller
    sellerType: {
        type: String,
        enum: ['big_market_seller'],
        default: 'big_market_seller'
    },

    // Multi-Item Bid Details
    bidItems: [{
        itemId: { 
            type: mongoose.Schema.Types.ObjectId, 
            required: true 
        },
        pricePerUnit: { 
            type: Number, 
            required: true,
            min: 0 
        },
        quantity: { 
            type: Number, 
            required: true 
        },
        totalPrice: { 
            type: Number, 
            required: true 
        }
    }],
    totalBidValue: {
        type: Number,
        required: true,
        min: 0
    },

    // Delivery Offer
    deliveryTimeline: {
        type: Number,
        required: true,
        min: 1,
        max: 7
    }, // in days
    deliveryCharges: { type: Number, default: 0 },
    freeDelivery: { type: Boolean, default: false },

    // Additional Offer
    discountOffered: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    sampleAvailable: { type: Boolean, default: false },
    qualityGuarantee: { type: Boolean, default: false },

    // Product Source
    sourceMarket: String,
    freshness: String,

    // Notes
    additionalNotes: String,
    termsAndConditions: String,

    // Bid Status
    status: {
        type: String,
        enum: ['active', 'withdrawn', 'outbid', 'won', 'lost'],
        default: 'active'
    },

    // Ranking (for reverse auction - 1 = lowest bid)
    rank: { type: Number, default: 0 },

    // Tracking
    viewedByBuyer: { type: Boolean, default: false },
    buyerViewedAt: Date,

    // When this bid was outbid
    outbidAt: Date,
    outbidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }

}, { timestamps: true });

// Ensure one seller can bid only once per auction
bidSchema.index({ auctionId: 1, sellerId: 1 }, { unique: true });

// Index for finding lowest bids
bidSchema.index({ auctionId: 1, totalBidValue: 1, deliveryTimeline: 1 });
bidSchema.index({ auctionId: 1, status: 1, totalBidValue: 1 });

// Pre-save: calculate totalBidValue if not set correctly
bidSchema.pre('save', function () {
    if (this.isModified('bidItems')) {
        this.totalBidValue = this.bidItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }
});

// Method to check if this bid is better than another
bidSchema.methods.isBetterThan = function (otherBid) {
    if (!otherBid) return true;
    // Lower price wins
    if (this.totalBidValue !== otherBid.totalBidValue) {
        return this.totalBidValue < otherBid.totalBidValue;
    }
    // If same price, faster delivery wins
    return this.deliveryTimeline < otherBid.deliveryTimeline;
};

// Static method to update rankings for an auction
bidSchema.statics.updateRankings = async function (auctionId) {
    const bids = await this.find({ auctionId, status: 'active' })
        .sort({ totalBidValue: 1, deliveryTimeline: 1, createdAt: 1 });

    for (let i = 0; i < bids.length; i++) {
        bids[i].rank = i + 1;
        await bids[i].save();
    }

    return bids;
};

module.exports = mongoose.model('Bid', bidSchema);