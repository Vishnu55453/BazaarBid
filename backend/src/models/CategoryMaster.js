const mongoose = require('mongoose');

const categoryMasterSchema = new mongoose.Schema({
    categoryId: {
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
    subCategories: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('CategoryMaster', categoryMasterSchema);
