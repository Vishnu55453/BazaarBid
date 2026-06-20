const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            isKirana: user.isKirana,
            isBigMarketSeller: user.isBigMarketSeller
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const normalizeLocation = (location) => {
    if (!location || typeof location !== 'object' || Array.isArray(location)) {
        return undefined;
    }

    const { type, coordinates, address, city, area, pincode, landmark } = location;

    // Only include pincode when it is a valid 6-digit Indian pincode
    const validPincode = pincode && /^[1-9][0-9]{5}$/.test(String(pincode)) ? pincode : undefined;

    const normalized = { address, city, area, pincode: validPincode, landmark };
    
    Object.keys(normalized).forEach(key => normalized[key] === undefined && delete normalized[key]);

    const coords = Array.isArray(coordinates) ? coordinates : [];
    const hasValidCoordinates = coords.length === 2 &&
        coords.every((value) => typeof value === 'number' && Number.isFinite(value));

    if (hasValidCoordinates) {
        normalized.type = 'Point';
        normalized.coordinates = coords;
    }

    return Object.keys(normalized).length > 0 ? normalized : undefined;
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name, email, phone, password, role,
            location, kiranaProfile, bigMarketProfile
        } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email or phone'
            });
        }

        // Create base user object
        const userData = {
            name,
            email,
            phone,
            password,
            role,
            location: normalizeLocation(location)
        };

        // Handle role-specific profile data
        if (role === 'kirana_user') {
            userData.kiranaProfile = kiranaProfile || {
                asBuyer: {},
                asSeller: {},
                inventory: []
            };
        }

        if (role === 'big_market_seller') {
            userData.bigMarketProfile = bigMarketProfile || {
                minOrderQty: 50,
                deliveryAvailable: true,
                deliveryRadius: 10
            };
        }

        // normal_buyer needs no additional data

        const user = new User(userData);
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Prepare response based on role
        const responseData = {
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                kycStatus: user.kycStatus
            }
        };

        // Add role-specific fields to response
        if (role === 'kirana_user' && user.kiranaProfile) {
            responseData.user.kiranaProfile = {
                asBuyer: user.kiranaProfile.asBuyer,
                asSeller: user.kiranaProfile.asSeller
            };
        }

        if (role === 'big_market_seller' && user.bigMarketProfile) {
            responseData.user.bigMarketProfile = {
                marketName: user.bigMarketProfile.marketName,
                shopName: user.bigMarketProfile.shopName,
                minOrderQty: user.bigMarketProfile.minOrderQty
            };
        }

        res.status(201).json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Prepare response
        const responseData = {
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                kycStatus: user.kycStatus,
                rating: user.rating,
                location: user.location
            }
        };

        // Add role-specific fields
        if (user.role === 'kirana_user' && user.kiranaProfile) {
            responseData.user.kiranaProfile = {
                asBuyer: {
                    preferredMarkets: user.kiranaProfile.asBuyer?.preferredMarkets,
                    deliveryAddress: user.kiranaProfile.asBuyer?.deliveryAddress
                },
                asSeller: {
                    shopName: user.kiranaProfile.asSeller?.shopName,
                    deliveryRadius: user.kiranaProfile.asSeller?.deliveryRadius,
                    isVerified: user.kiranaProfile.asSeller?.isVerified
                }
            };
            responseData.user.inventoryCount = user.kiranaProfile.inventory?.length || 0;
        }

        if (user.role === 'big_market_seller' && user.bigMarketProfile) {
            responseData.user.bigMarketProfile = {
                marketName: user.bigMarketProfile.marketName,
                shopName: user.bigMarketProfile.shopName,
                shopNumber: user.bigMarketProfile.shopNumber,
                minOrderQty: user.bigMarketProfile.minOrderQty,
                verified: user.bigMarketProfile.verified
            };
        }

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('createdBy', 'name email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const responseData = {
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive,
                kycStatus: user.kycStatus,
                rating: user.rating,
                location: user.location,
                totalOrders: user.totalOrders,
                totalSales: user.totalSales,
                walletBalance: user.walletBalance,
                createdAt: user.createdAt
            }
        };

        // Add role-specific data
        if (user.role === 'kirana_user' && user.kiranaProfile) {
            responseData.user.kiranaProfile = user.kiranaProfile;
        }

        if (user.role === 'big_market_seller' && user.bigMarketProfile) {
            responseData.user.bigMarketProfile = user.bigMarketProfile;
        }

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update Profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const allowedUpdates = ['name', 'phone', 'location', 'preferences'];
        const updateData = {};
        const unsetFields = {};

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'location') {
                    const normalizedLocation = normalizeLocation(req.body.location);
                    if (normalizedLocation) {
                        updateData.location = normalizedLocation;
                    } else {
                        unsetFields.location = '';
                    }
                    return;
                }

                updateData[field] = req.body[field];
            }
        });

        // Handle role-specific profile updates
        const user = await User.findById(req.user.id);

        if (user.role === 'kirana_user' && req.body.kiranaProfile) {
            if (req.body.kiranaProfile.asBuyer) {
                updateData['kiranaProfile.asBuyer'] = {
                    ...user.kiranaProfile.asBuyer,
                    ...req.body.kiranaProfile.asBuyer
                };
            }
            if (req.body.kiranaProfile.asSeller) {
                updateData['kiranaProfile.asSeller'] = {
                    ...user.kiranaProfile.asSeller,
                    ...req.body.kiranaProfile.asSeller
                };
            }
        }

        if (user.role === 'big_market_seller' && req.body.bigMarketProfile) {
            updateData['bigMarketProfile'] = {
                ...user.bigMarketProfile,
                ...req.body.bigMarketProfile
            };
        }

        const updateQuery = {
            $set: updateData
        };

        if (Object.keys(unsetFields).length > 0) {
            updateQuery.$unset = unsetFields;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateQuery,
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get All Sellers (for normal buyers to browse)
// @route   GET /api/auth/sellers
// @access  Private
const getSellers = async (req, res) => {
    try {
        const { market, area, pincode, search } = req.query;

        // Query both kirana sellers and big market sellers
        const query = {
            role: { $in: ['kirana_user', 'big_market_seller'] },
            isActive: true
        };

        // Filter by market (for big market sellers)
        if (market) {
            query['bigMarketProfile.marketName'] = market;
        }

        // Filter by area/pincode for kirana sellers (local)
        if (area) {
            query['location.area'] = { $regex: area, $options: 'i' };
        }
        if (pincode) {
            query['location.pincode'] = pincode;
        }

        // Search by shop name or seller name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'kiranaProfile.asSeller.shopName': { $regex: search, $options: 'i' } },
                { 'bigMarketProfile.shopName': { $regex: search, $options: 'i' } }
            ];
        }

        const sellers = await User.find(query)
            .select('name role rating location kiranaProfile.asSeller bigMarketProfile')
            .limit(50);

        // Format response based on seller type
        const formattedSellers = sellers.map(seller => {
            const baseInfo = {
                id: seller._id,
                name: seller.name,
                role: seller.role,
                rating: seller.rating,
                location: seller.location
            };

            if (seller.role === 'kirana_user') {
                return {
                    ...baseInfo,
                    shopName: seller.kiranaProfile?.asSeller?.shopName,
                    deliveryRadius: seller.kiranaProfile?.asSeller?.deliveryRadius,
                    sellerType: 'local_kirana'
                };
            } else {
                return {
                    ...baseInfo,
                    shopName: seller.bigMarketProfile?.shopName,
                    marketName: seller.bigMarketProfile?.marketName,
                    minOrderQty: seller.bigMarketProfile?.minOrderQty,
                    sellerType: 'big_market'
                };
            }
        });

        res.json({
            success: true,
            count: formattedSellers.length,
            sellers: formattedSellers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Kirana Sellers in a specific area (for normal buyers)
// @route   GET /api/auth/nearby-kirana
// @access  Private
const getNearbyKirana = async (req, res) => {
    try {
        const { pincode, area, lat, lng, radius = 5 } = req.query;

        let query = {
            role: 'kirana_user',
            isActive: true
        };

        // Filter by pincode
        if (pincode) {
            query['location.pincode'] = pincode;
        }

        // Filter by area
        if (area) {
            query['location.area'] = { $regex: area, $options: 'i' };
        }

        // Geo-location based search (if coordinates provided)
        if (lat && lng) {
            query['location.coordinates'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            };
        }

        const kiranaSellers = await User.find(query)
            .select('name location rating kiranaProfile.asSeller totalOrders')
            .limit(30);

        const formattedSellers = kiranaSellers.map(seller => ({
            id: seller._id,
            shopName: seller.kiranaProfile?.asSeller?.shopName || seller.name,
            location: seller.location,
            rating: seller.rating,
            totalOrders: seller.totalOrders,
            deliveryRadius: seller.kiranaProfile?.asSeller?.deliveryRadius
        }));

        res.json({
            success: true,
            count: formattedSellers.length,
            kiranaSellers: formattedSellers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Big Market Sellers (for kirana users to buy from)
// @route   GET /api/auth/big-market-sellers
// @access  Private
const getBigMarketSellers = async (req, res) => {
    try {
        const { marketName, verifiedOnly = true } = req.query;

        const query = {
            role: 'big_market_seller',
            isActive: true
        };

        if (marketName) {
            query['bigMarketProfile.marketName'] = marketName;
        }

        if (verifiedOnly) {
            query['bigMarketProfile.verified'] = true;
        }

        const sellers = await User.find(query)
            .select('name bigMarketProfile rating location totalSales')
            .limit(50);

        res.json({
            success: true,
            count: sellers.length,
            sellers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    getSellers,
    getNearbyKirana,
    getBigMarketSellers
};