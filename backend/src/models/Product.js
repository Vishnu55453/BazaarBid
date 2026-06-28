const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // SELLER TYPE - Who is selling this product
    sellerType: {
        type: String,
        enum: ['kirana_user', 'big_market_seller'],
        required: true,
        index: true
    },

    // Basic Product Info
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        index: true
    },
    description: String,
    sku: { type: String, unique: true }, // Stock Keeping Unit

    // Category
    category: {
        type: String,
        enum: {
            values: [
                'dry_fruits', 'fresh_fruits', 'vegetables', 'grocery', 'spices',
                'bakery', 'meat_fish', 'organic', 'snacks', 'dairy', 'beverages',
                'oils', 'rice_wheat', 'sugar_jaggery', 'pickles_papad', 'frozen_foods',
                'grains_pulses'
            ],
            message: '{VALUE} is not a valid category'
        },
        required: true
    },
    subCategory: String,
    tags: [String], // For search: ['cashew', 'kaju', 'premium']

    // Pricing (For Normal Buyers)
    unit: {
        type: String,
        enum: ['kg', 'gram', 'litre', 'ml', 'dozen', 'piece', 'box', 'bundle'],
        required: true
    },
    pricePerUnit: {
        type: Number,
        required: true,
        min: 0
    },
    compareAtPrice: Number, // Original price for discount display

    // Bulk Pricing (For Kirana Users buying from Big Market Sellers)
    bulkPricing: [{
        minQuantity: { type: Number, required: true },
        maxQuantity: { type: Number },
        pricePerUnit: { type: Number, required: true },
        discount: { type: Number, min: 0, max: 100 } // Discount percentage
    }],

    // MINIMUM ORDER QUANTITY (Different for each seller type)
    minOrderQty: {
        type: Number,
        default: function() {
            return this.sellerType === 'big_market_seller' ? 50 : 1;
        }
    },

    // DELIVERY RADIUS (For Kirana sellers - local delivery only)
    deliveryRadius: {
        type: Number,
        default: function() {
            return this.sellerType === 'kirana_user' ? 3 : null;
        }
    },

    // FOR KIRANA RESELLING (Track origin of product when kirana is reselling)
    isResaleProduct: {
        type: Boolean,
        default: false
    },
    originalProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    originalPurchasePrice: {
        type: Number,
        default: null
    },
    sourceSellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Inventory
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    reservedStock: { type: Number, default: 0 }, // For pending orders
    maximumOrderQty: Number,

    // Images & Media
    images: [{
        url: { type: String, required: true },
        publicId: String,
        isPrimary: { type: Boolean, default: false }
    }],
    videos: [String],

    // Product Attributes
    attributes: {
        brand: String,
        origin: String, // e.g., 'Afghanistan' for dry fruits
        variety: String, // e.g., 'Gir Kesar' for mangoes
        grade: String, // e.g., 'A', 'B', 'Premium'
        organic: { type: Boolean, default: false },
        vegetarian: { type: Boolean, default: true },
        shelfLife: String, // e.g., '6 months'
        storageInstructions: String
    },

    // Seller Info (denormalized for faster display)
    sellerShopName: String,
    sellerMarket: String, // 'Vashi Fruit Market', 'Byculla Market', etc.
    sellerRating: Number,

    // Status
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // Delivery Options
    deliveryAvailable: { type: Boolean, default: true },
    deliveryCharges: { type: Number, default: 0 },
    freeDeliveryAbove: { type: Number },

    // SEO
    seoTitle: String,
    seoDescription: String,

    // Stats
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

}, {
    timestamps: true
});

// Indexes for search & filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ sellerId: 1, isAvailable: 1 });
productSchema.index({ pricePerUnit: 1 });
productSchema.index({ sellerMarket: 1 });
productSchema.index({ sellerType: 1, minOrderQty: 1 });
productSchema.index({ 'attributes.organic': 1 });
productSchema.index({ isResaleProduct: 1, originalProductId: 1 });

// Virtual for available stock
productSchema.virtual('availableStock').get(function () {
    return this.stock - this.reservedStock;
});

// Virtual to check if product is from big market seller
productSchema.virtual('isFromBigMarket').get(function () {
    return this.sellerType === 'big_market_seller';
});

// Virtual to check if product is from kirana seller
productSchema.virtual('isFromKirana').get(function () {
    return this.sellerType === 'kirana_user';
});

// Pre-save validation
productSchema.pre('save', function () {
    if (!this.sku) {
        const uniqueId = new mongoose.Types.ObjectId().toHexString().slice(-10).toUpperCase();
        this.sku = `PRD-${uniqueId}`;
    }

    // Sort bulk pricing by minQuantity
    if (this.bulkPricing && this.bulkPricing.length > 0) {
        this.bulkPricing.sort((a, b) => a.minQuantity - b.minQuantity);
    }

    // Ensure minOrderQty is appropriate for seller type
    if (this.sellerType === 'big_market_seller' && this.minOrderQty < 50) {
        this.minOrderQty = 50;
    }
});

module.exports = mongoose.model('Product', productSchema);