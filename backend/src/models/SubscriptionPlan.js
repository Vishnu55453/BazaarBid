const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    planCode: {
        type: String,
        required: true,
        unique: true,
        enum: ['free_buyer', 'premium_buyer', 'free_seller', 'premium_seller']
    },
    name: {
        type: String,
        required: true
    },
    pricePerMonth: {
        type: Number,
        required: true,
        default: 0
    },
    features: {
        maxAuctionsPerMonth: {
            type: Number, // -1 means unlimited
            required: true,
            default: -1
        },
        maxBidsPerMonth: {
            type: Number, // -1 means unlimited
            required: true,
            default: -1
        },
        canViewCompetitors: {
            type: Boolean,
            required: true,
            default: false
        },
        canOfferDiscounts: {
            type: Boolean,
            required: true,
            default: false
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
