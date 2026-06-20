const Product = require('../models/Product');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Kirana User or Big Market Seller only)
const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            description,
            category,
            subCategory,
            unit,
            pricePerUnit,
            compareAtPrice,
            bulkPricing,
            stock,
            minimumOrderQty,
            maximumOrderQty,
            attributes,
            tags,
            isAvailable,
            isOrganic,
            // For resale products (kirana selling bought items)
            isResaleProduct,
            originalProductId,
            originalPurchasePrice,
            sourceSellerId
        } = req.body;

        const normalizedAttributes = {
            ...(attributes || {}),
            organic: isOrganic ?? attributes?.organic ?? false
        };

        const normalizedTags = Array.isArray(tags)
            ? tags
            : typeof tags === 'string'
                ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
                : [];

        // Get seller details
        const seller = await User.findById(req.user.id);
        
        // Check if user can create products (kirana_user or big_market_seller)
        if (!seller || (seller.role !== 'kirana_user' && seller.role !== 'big_market_seller')) {
            return res.status(403).json({ 
                message: 'Only Kirana users and Big Market sellers can create products' 
            });
        }

        // Determine seller type for the product
        const sellerType = seller.role; // 'kirana_user' or 'big_market_seller'

        // Handle image uploads if files exist
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map((file, index) => ({
                url: `/uploads/products/${file.filename}`,  // Local URL path
                publicId: file.filename,
                isPrimary: index === 0
            }));
        }

        // Get seller shop name based on role
        let sellerShopName = seller.name;
        let sellerMarket = null;
        
        if (sellerType === 'kirana_user') {
            sellerShopName = seller.kiranaProfile?.asSeller?.shopName || seller.name;
        } else if (sellerType === 'big_market_seller') {
            sellerShopName = seller.bigMarketProfile?.shopName || seller.name;
            sellerMarket = seller.bigMarketProfile?.marketName;
        }

        // Create product
        const productData = {
            sellerId: req.user.id,
            sellerType: sellerType,
            name,
            description,
            category,
            subCategory,
            unit,
            pricePerUnit,
            compareAtPrice,
            bulkPricing: bulkPricing || [],
            stock,
            minimumOrderQty: minimumOrderQty || (sellerType === 'big_market_seller' ? 50 : 1),
            maximumOrderQty,
            attributes: normalizedAttributes,
            tags: normalizedTags,
            images,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            sellerShopName,
            sellerMarket,
            sellerRating: seller.rating?.average || 0,
            // For resale products
            isResaleProduct: isResaleProduct || false,
            originalProductId: originalProductId || null,
            originalPurchasePrice: originalPurchasePrice || null,
            sourceSellerId: sourceSellerId || null
        };

        // Set delivery radius for kirana users
        if (sellerType === 'kirana_user') {
            productData.deliveryRadius = 3; // 3km local delivery
        }

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            message: 'Failed to create product',
            error: error.message
        });
    }
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            subCategory,
            minPrice,
            maxPrice,
            search,
            sellerId,
            sellerType,
            isAvailable,
            isOrganic,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            // For normal buyers - find nearby kirana shops
            pincode,
            area
        } = req.query;

        // Build filter object
        const filter = {};

        if (category) filter.category = category;
        if (subCategory) filter.subCategory = subCategory;
        if (sellerId) filter.sellerId = sellerId;
        if (sellerType) filter.sellerType = sellerType;
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
        if (isOrganic !== undefined) filter.isOrganic = isOrganic === 'true';

        // Price range
        if (minPrice || maxPrice) {
            filter.pricePerUnit = {};
            if (minPrice) filter.pricePerUnit.$gte = parseFloat(minPrice);
            if (maxPrice) filter.pricePerUnit.$lte = parseFloat(maxPrice);
        }

        // Search in name and description
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        let products = await Product.find(filter)
            .populate('sellerId', 'name role rating location kiranaProfile.asSeller bigMarketProfile')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Filter by location/pincode for normal buyers (kirana shops only)
        if (pincode || area) {
            products = products.filter(product => {
                if (product.sellerType !== 'kirana_user') return false;
                const sellerLocation = product.sellerId?.location;
                if (pincode && sellerLocation?.pincode !== pincode) return false;
                if (area && sellerLocation?.area !== area) return false;
                return true;
            });
        }

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name email phone role rating location kiranaProfile.asSeller bigMarketProfile')
            .populate('originalProductId', 'name pricePerUnit unit')
            .populate('sourceSellerId', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Increment view count
        product.views += 1;
        await product.save();

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller who owns the product)
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check ownership
        if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to update this product' });
        }

        const {
            name,
            description,
            category,
            subCategory,
            unit,
            pricePerUnit,
            compareAtPrice,
            bulkPricing,
            stock,
            minimumOrderQty,
            maximumOrderQty,
            attributes,
            isAvailable,
            isOrganic,
            isFeatured
        } = req.body;

        // Update fields
        if (name) product.name = name;
        if (description !== undefined) product.description = description;
        if (category) product.category = category;
        if (subCategory) product.subCategory = subCategory;
        if (unit) product.unit = unit;
        if (pricePerUnit) product.pricePerUnit = pricePerUnit;
        if (compareAtPrice) product.compareAtPrice = compareAtPrice;
        if (bulkPricing) product.bulkPricing = bulkPricing;
        if (stock !== undefined) product.stock = stock;
        if (minimumOrderQty) product.minimumOrderQty = minimumOrderQty;
        if (maximumOrderQty) product.maximumOrderQty = maximumOrderQty;
        if (attributes) product.attributes = { ...product.attributes, ...attributes };
        if (isAvailable !== undefined) product.isAvailable = isAvailable;
        if (isOrganic !== undefined) product.isOrganic = isOrganic;
        if (isFeatured !== undefined && req.user.role === 'admin') product.isFeatured = isFeatured;

        // Handle new images if uploaded (local storage)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                product.images.push({
                    url: `/uploads/products/${file.filename}`,
                    publicId: file.filename,
                    isPrimary: product.images.length === 0
                });
            }
        }

        product.updatedAt = Date.now();
        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller who owns the product)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check ownership
        if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to delete this product' });
        }

        // Delete images from local storage
        for (const image of product.images) {
            if (image.publicId) {
                const imagePath = path.join(__dirname, '..', '..', 'uploads', 'products', image.publicId);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

// @desc    Get seller's products
// @route   GET /api/products/seller/:sellerId
// @access  Public
const getSellerProducts = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const products = await Product.find({
            sellerId,
            isAvailable: true
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Product.countDocuments({ sellerId, isAvailable: true });

        res.json({
            success: true,
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({
            message: 'Failed to fetch seller products',
            error: error.message
        });
    }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private (Seller)
const updateStock = async (req, res) => {
    try {
        const { stock, operation, quantity } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.sellerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (operation === 'decrease') {
            if (product.stock < quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            product.stock -= quantity;
        } else if (operation === 'increase') {
            product.stock += quantity;
        } else if (stock !== undefined) {
            product.stock = stock;
        }

        await product.save();

        // If this is a kirana resale product, also update kirana's inventory
        if (product.isResaleProduct && product.sellerType === 'kirana_user') {
            await User.findByIdAndUpdate(
                product.sellerId,
                {
                    $set: {
                        'kiranaProfile.inventory.$[elem].stock': product.stock,
                        'kiranaProfile.inventory.$[elem].lastUpdated': new Date()
                    }
                },
                {
                    arrayFilters: [{ 'elem.productId': product._id }]
                }
            );
        }

        res.json({
            success: true,
            message: 'Stock updated successfully',
            stock: product.stock
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            message: 'Failed to update stock',
            error: error.message
        });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 20, sellerType } = req.query;

        const filter = {
            category,
            isAvailable: true,
            stock: { $gt: 0 }
        };
        
        if (sellerType) filter.sellerType = sellerType;

        const products = await Product.find(filter)
            .sort({ totalSold: -1 }) // Best sellers first
            .limit(parseInt(limit));

        res.json({
            success: true,
            category,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// @desc    Get products for normal buyers (filtered by location)
// @route   GET /api/products/nearby
// @access  Private (Normal Buyer)
const getNearbyProducts = async (req, res) => {
    try {
        const { pincode, area, limit = 50 } = req.query;
        
        if (!pincode && !area) {
            return res.status(400).json({ message: 'Please provide pincode or area' });
        }

        // Find kirana sellers in the area
        const kiranaSellers = await User.find({
            role: 'kirana_user',
            isActive: true,
            'kycStatus': 'verified',
            ...(pincode && { 'location.pincode': pincode }),
            ...(area && { 'location.area': { $regex: area, $options: 'i' } })
        }).select('_id');

        const sellerIds = kiranaSellers.map(s => s._id);

        // Get products from these kirana sellers
        const products = await Product.find({
            sellerId: { $in: sellerIds },
            sellerType: 'kirana_user',
            isAvailable: true,
            stock: { $gt: 0 }
        })
            .populate('sellerId', 'name location rating kiranaProfile.asSeller')
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get nearby products error:', error);
        res.status(500).json({
            message: 'Failed to fetch nearby products',
            error: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    updateStock,
    getProductsByCategory,
    getNearbyProducts
};