const mongoose = require('mongoose');

const marketMasterSchema = new mongoose.Schema({
    marketId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Vegetables', 'Fruits', 'Dry Fruits', 'Grains', 'Mixed', 'Other'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('MarketMaster', marketMasterSchema);
