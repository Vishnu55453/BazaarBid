const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },

    // Profile
    profileImage: {
        url: String,
        publicId: String
    },

    // Role Based Access - SIMPLIFIED to 3 roles
    role: {
        type: String,
        enum: {
            values: ['normal_buyer', 'kirana_user', 'big_market_seller', 'admin'],
            message: '{VALUE} is not a valid role'
        },
        required: true
    },

    // Account Status
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    // KIRANA USER ONLY (Dual Role - Heart of the platform)
    kiranaProfile: {
        // As BUYER (purchasing bulk from big market sellers)
        asBuyer: {
            gstNumber: {
                type: String,
                uppercase: true,
                match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
            },
            preferredMarkets: {
                type: [String],
                default: []
            },
            deliveryAddress: {
                shopName: String,
                area: String,
                city: String,
                pincode: {
                    type: String,
                    match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
                },
                fullAddress: String,
                landmark: String
            },
            avgMonthlyPurchase: { type: Number, default: 0 } // In rupees
        },

        // As SELLER (selling retail to normal buyers in locality)
        asSeller: {
            shopName: { type: String },
            deliveryRadius: { type: Number, default: 3 }, // kilometers
            openingHours: String,
            isVerified: { type: Boolean, default: false },
            platformCommission: { type: Number, default: 5 }, // 5% commission on sales
            shopImages: [{
                url: String,
                publicId: String
            }]
        },

        // Current Inventory (products bought from big market, ready to sell)
        inventory: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            originalProductName: String,
            category: String,      // e.g. 'fresh_fruits', 'vegetables', etc.
            purchasePrice: Number, // Price paid to big market seller
            sellingPrice: Number,  // Current selling price to normal buyers
            stock: Number,         // Available quantity in kg/ltr
            unit: String,          // kg, gram, litre, etc.
            sourceSellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Which big market seller sold this
            purchasedAt: { type: Date, default: Date.now },
            lastUpdated: { type: Date, default: Date.now }
        }]
    },

    // BIG MARKET SELLER ONLY (Wholesalers from Vashi, Byculla, etc.)
    bigMarketProfile: {
        marketName: {
            type: String,
            required: function () { return this.role === 'big_market_seller'; }
        },
        shopNumber: String,
        shopName: String,
        licenseNumber: String,
        gstNumber: {
            type: String,
            uppercase: true,
            match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
        },
        minOrderQty: { type: Number, default: 50 }, // Minimum 50kg for wholesale
        deliveryAvailable: { type: Boolean, default: true },
        deliveryRadius: { type: Number, default: 10 }, // kilometers from market
        deliveryCharges: { type: Number, default: 0 },
        verified: { type: Boolean, default: false }
    },

    // Location (for all users)
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number] // [longitude, latitude]
        },
        address: String,
        city: String,
        area: String,
        pincode: {
            type: String,
            match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
        },
        landmark: String
    },

    // Ratings & Performance
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    totalOrders: { type: Number, default: 0 }, // As seller
    totalPurchases: { type: Number, default: 0 }, // As buyer
    totalSales: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },

    // Wallet & Payments
    walletBalance: { type: Number, default: 0 },
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        verified: { type: Boolean, default: false }
    },

    // KYC Status
    kycStatus: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'rejected'],
        default: 'pending'
    },

    // Subscription & Usage
    subscription: {
        planCode: { 
            type: String, 
            enum: ['free_buyer', 'premium_buyer', 'free_seller', 'premium_seller'],
            // Will be set dynamically during registration based on role
        },
        billingCycleStart: { type: Date, default: Date.now },
        status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' }
    },
    usageMetrics: {
        auctionsThisMonth: { type: Number, default: 0 },
        bidsThisMonth: { type: Number, default: 0 }
    },

    // Preferences
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        },
        language: { type: String, default: 'en' },
        currency: { type: String, default: 'INR' }
    },

    // For Admin Actions
    notes: String,
    lastLogin: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, {
    timestamps: true
});

// Indexes for faster queries
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'kiranaProfile.asSeller.shopName': 1 });
userSchema.index({ 'bigMarketProfile.marketName': 1 });
userSchema.index({ 'kiranaProfile.asBuyer.gstNumber': 1 }, { sparse: true });
userSchema.index({ 'bigMarketProfile.gstNumber': 1 }, { sparse: true });

// Hash password and normalize location before saving
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    // Set default subscription if not present
    if (!this.subscription || !this.subscription.planCode) {
        this.subscription = this.subscription || {};
        if (this.role === 'kirana_user') {
            this.subscription.planCode = 'free_buyer';
        } else if (this.role === 'big_market_seller') {
            this.subscription.planCode = 'free_seller';
        }
    }

    const coordinates = this.location?.coordinates;
    const hasValidCoordinates = Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        coordinates.every((value) => typeof value === 'number');

    if (!hasValidCoordinates && this.location) {
        this.location.coordinates = undefined;
        this.location.type = undefined;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual: Check if user is kirana (dual role)
userSchema.virtual('isKirana').get(function () {
    return this.role === 'kirana_user';
});

// Virtual: Check if user is big market seller
userSchema.virtual('isBigMarketSeller').get(function () {
    return this.role === 'big_market_seller';
});

// Virtual: Check if user is normal buyer
userSchema.virtual('isNormalBuyer').get(function () {
    return this.role === 'normal_buyer';
});

// Hide sensitive fields when sending to client
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.bankDetails;
    return user;
};

module.exports = mongoose.model('User', userSchema);