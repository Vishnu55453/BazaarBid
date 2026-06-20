const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    icon: String,
    image: String,
    level: { type: Number, default: 0 }, // 0=main, 1=sub, 2=sub-sub
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

    // For filtering
    attributes: [{
        name: String,
        type: String, // 'string', 'number', 'boolean'
        options: [String]
    }],

}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);