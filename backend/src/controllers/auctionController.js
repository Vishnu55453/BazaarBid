const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { createAuctionOrder } = require('../services/orderService');
const { validationResult } = require('express-validator');
const { sendNotification } = require('../services/socketService');

// Helper to determine active plan features
const getUserPlanFeatures = async (userObjOrId) => {
    let user = userObjOrId;
    if (!user.subscription) {
        user = await User.findById(user._id || user.id || userObjOrId);
    }
    
    let planCode = user?.subscription?.planCode;
    if (!planCode) {
        planCode = user?.role === 'kirana_user' ? 'free_buyer' : 'free_seller';
    }
    const plan = await SubscriptionPlan.findOne({ planCode });
    return plan?.features || { maxAuctionsPerMonth: 0, maxBidsPerMonth: 0, canViewCompetitors: false, canOfferDiscounts: false };
};

// @desc    Create new auction (Kirana User only)
// @route   POST /api/auctions
// @access  Private (Kirana User only)
const createAuction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            items,
            allowPartialBids,
            preferredMarket,
            deliveryAddress,
            deliveryTimeline,

            endTime,
            autoAward,
            minRatingRequired,
            verifiedSellersOnly,
            advancePercent
        } = req.body;

        // Check if user is kirana_user (use accountId to support staff)
        const buyer = await User.findById(req.user.accountId || req.user.id);
        if (!buyer || buyer.role !== 'kirana_user') {
            return res.status(403).json({ message: 'Only Kirana users can create auctions' });
        }

        // SaaS Limit Check
        const features = await getUserPlanFeatures(buyer);
        const usage = buyer.usageMetrics || { auctionsThisMonth: 0 };
        
        if (features.maxAuctionsPerMonth !== -1 && usage.auctionsThisMonth >= features.maxAuctionsPerMonth) {
            return res.status(403).json({
                message: `Limit reached (${features.maxAuctionsPerMonth} auctions/month). Please upgrade your subscription to publish more auctions.`,
                requiresUpgrade: true
            });
        }

        if (verifiedSellersOnly && !features.canFilterVerifiedSellers) {
            return res.status(403).json({
                message: 'Filtering for verified sellers is a premium feature. Please upgrade your plan.',
                requiresUpgrade: true
            });
        }

        // Calculate expected delivery date
        const expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + deliveryTimeline);

        // Handle delivery address from addressId or direct object
        let finalDeliveryAddress = deliveryAddress || {};
        if (req.body.addressId) {
            const savedAddress = buyer.kiranaProfile?.asBuyer?.deliveryAddresses?.find(
                addr => addr._id.toString() === req.body.addressId
            );
            if (savedAddress) {
                finalDeliveryAddress = savedAddress;
            }
        }

        // Create auction
        const auction = new Auction({
            buyerId: buyer._id,
            buyerType: 'kirana_user',
            items: items.map(item => ({
                productName: item.productName,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                qualitySpecs: item.qualitySpecs || {},
                budgetRange: item.budgetRange || {},
                status: 'open'
            })),
            allowPartialBids: allowPartialBids || false,
            preferredMarket: preferredMarket || 'any',
            deliveryAddress: {
                shopName: finalDeliveryAddress.shopName || buyer.kiranaProfile?.asBuyer?.deliveryAddresses?.[0]?.shopName || buyer.name,
                area: finalDeliveryAddress.area || buyer.location?.area,
                city: finalDeliveryAddress.city || buyer.location?.city,
                pincode: finalDeliveryAddress.pincode || buyer.location?.pincode,
                landmark: finalDeliveryAddress.landmark,
                fullAddress: finalDeliveryAddress.fullAddress
            },
            deliveryTimeline,
            expectedDeliveryDate,

            startTime: new Date(),
            endTime: new Date(endTime),
            autoAward: autoAward !== undefined ? autoAward : true,
            status: 'open',
            minRatingRequired: minRatingRequired ? Number(minRatingRequired) : 0,
            verifiedSellersOnly: verifiedSellersOnly || false,
            advancePercent: advancePercent !== undefined ? Number(advancePercent) : 0
        });

        await auction.save();

        // Increment usage
        buyer.usageMetrics = buyer.usageMetrics || { auctionsThisMonth: 0 };
        buyer.usageMetrics.auctionsThisMonth = (buyer.usageMetrics.auctionsThisMonth || 0) + 1;
        await buyer.save();

        res.status(201).json({
            success: true,
            message: 'Auction created successfully',
            auction
        });
    } catch (error) {
        console.error('Create auction error:', error);
        res.status(500).json({
            message: 'Failed to create auction',
            error: error.message
        });
    }
};

// @desc    Get all open auctions (for Big Market Sellers)
// @route   GET /api/auctions/open
// @access  Private (Big Market Sellers)
const getOpenAuctions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            preferredMarket,
            minQuantity,
            maxQuantity
        } = req.query;

        const filter = {
            status: 'open',
            endTime: { $gt: new Date() }
        };

        // Filter out auctions requiring a higher rating than the seller has
        const seller = await User.findById(req.user.id);
        const sellerRating = seller?.rating?.average || 0;
        filter.minRatingRequired = { $lte: sellerRating };

        // Filter out verified-only auctions if seller is not verified
        if (!seller?.bigMarketProfile?.verified) {
            filter.verifiedSellersOnly = { $ne: true };
        }

        if (category) filter.category = category;
        if (preferredMarket && preferredMarket !== 'any') filter.preferredMarket = preferredMarket;
        if (minQuantity) filter.quantity = { $gte: parseInt(minQuantity) };
        if (maxQuantity) filter.quantity = { ...filter.quantity, $lte: parseInt(maxQuantity) };

        const auctions = await Auction.find(filter)
            .populate('buyerId', 'name location kiranaProfile.asBuyer')
            .sort({ endTime: 1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Auction.countDocuments(filter);

        // Get bid count for each auction
        const auctionsWithBidCount = await Promise.all(auctions.map(async (auction) => {
            const bidCount = await Bid.countDocuments({ auctionId: auction._id, status: 'active' });
            const lowestBid = await Bid.findOne({ auctionId: auction._id, status: 'active' })
                .sort({ totalBidValue: 1, deliveryTimeline: 1 });
            
            const auctionObj = auction.toObject();

            // ANONYMOUS BIDDING MASKING
            if (auctionObj.buyerId) {
                auctionObj.buyerId.name = 'Verified Retailer';
                if (auctionObj.buyerId.kiranaProfile && auctionObj.buyerId.kiranaProfile.asBuyer) {
                    auctionObj.buyerId.kiranaProfile.asBuyer.shopName = 'Verified Retailer';
                }
            }
            if (auctionObj.deliveryAddress) {
                auctionObj.deliveryAddress.shopName = 'Verified Retailer';
            }

            return {
                ...auctionObj,
                bidCount,
                lowestBid: lowestBid ? {
                    totalBidValue: lowestBid.totalBidValue,
                    deliveryTimeline: lowestBid.deliveryTimeline
                } : null
            };
        }));

        res.json({
            success: true,
            auctions: auctionsWithBidCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get open auctions error:', error);
        res.status(500).json({
            message: 'Failed to fetch auctions',
            error: error.message
        });
    }
};

// @desc    Get auction by ID with all bids
// @route   GET /api/auctions/:id
// @access  Private (Both buyer and sellers)
const getAuctionById = async (req, res) => {
    try {
        let auction = await Auction.findById(req.params.id)
            .populate('buyerId', 'name phone email location kiranaProfile.asBuyer rating')
            .populate('winningSellerId', 'name bigMarketProfile')
            .populate('winningBidId')
            .populate('orderId', 'status')
            .lean();

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Populate market name if it's an ObjectId
        const mongoose = require('mongoose');
        const MarketMaster = require('../models/MarketMaster');
        if (auction.preferredMarket && mongoose.Types.ObjectId.isValid(auction.preferredMarket)) {
            const mkt = await MarketMaster.findById(auction.preferredMarket);
            if (mkt) {
                auction.preferredMarketName = mkt.name;
            }
        }

        // Get all bids for this auction
        let bids = await Bid.find({ auctionId: auction._id, status: { $in: ['active', 'won'] } })
            .populate('sellerId', 'name bigMarketProfile rating subscription')
            .sort({ totalBidValue: 1, deliveryTimeline: 1 })
            .lean();

        // Get user's own bid if they are a seller
        let userBid = null;
        if (req.user.role === 'big_market_seller') {
            userBid = await Bid.findOne({ auctionId: auction._id, sellerId: req.user.id }).lean();
        }

        // --- ANONYMOUS BIDDING LOGIC ---
        const isBuyer = req.user.role === 'kirana_user';
        const isWinner = auction.winningSellerId && auction.winningSellerId._id.toString() === req.user.id;

        // 1. Mask Buyer Identity for Sellers (unless they won)
        if (!isBuyer && !isWinner && auction.buyerId) {
            auction.buyerId.name = 'Verified Retailer';
            if (auction.buyerId.kiranaProfile && auction.buyerId.kiranaProfile.asBuyer) {
                auction.buyerId.kiranaProfile.asBuyer.shopName = 'Verified Retailer';
            }
            if (auction.deliveryAddress) {
                auction.deliveryAddress.shopName = 'Verified Retailer';
            }
        }

        // 2. Mask Seller Identities in Bids
        bids = bids.map((bid, index) => {
            const isOwnBid = bid.sellerId && bid.sellerId._id.toString() === req.user.id;
            const isWinningBidForBuyer = isBuyer && bid.status === 'won';

            if (!isOwnBid && !isWinningBidForBuyer && bid.sellerId) {
                bid.sellerId.name = isBuyer ? `Supplier #${index + 1}` : `Competitor`;
                if (bid.sellerId.bigMarketProfile) {
                    bid.sellerId.bigMarketProfile.shopName = bid.sellerId.name;
                }
            }
            return bid;
        });
        // -------------------------------

        // 3. SaaS Feature Check: Can view competitors?
        let canViewCompetitors = true;
        let canOfferDiscounts = true;
        
        if (req.user.role === 'big_market_seller') {
            const features = await getUserPlanFeatures(req.user);
            canViewCompetitors = features.canViewCompetitors;
            canOfferDiscounts = features.canOfferDiscounts;
            
            if (!canViewCompetitors) {
                bids = []; // Hide competitor bids completely
            }
        }

        res.json({
            success: true,
            auction,
            bids,
            userBid,
            totalBids: bids.length,
            features: {
                canViewCompetitors,
                canOfferDiscounts
            }
        });
    } catch (error) {
        console.error('Get auction error:', error);
        res.status(500).json({
            message: 'Failed to fetch auction',
            error: error.message
        });
    }
};

// @desc    Get auctions created by me (Kirana User)
// @route   GET /api/auctions/my-auctions
// @access  Private (Kirana User)
const getMyAuctions = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        const filter = { buyerId: req.user.accountId || req.user.id };
        if (status) filter.status = status;

        const auctions = await Auction.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('winningSellerId', 'name bigMarketProfile');

        const total = await Auction.countDocuments(filter);

        // Enrich each auction with live bid count and lowest bid price
        const auctionsWithBidCount = await Promise.all(auctions.map(async (auction) => {
            const totalBids = await Bid.countDocuments({ auctionId: auction._id });
            const lowestBidDoc = await Bid.findOne({
                auctionId: auction._id,
                status: { $in: ['active', 'won'] }
            }).sort({ bidPrice: 1 });

            return {
                ...auction.toObject(),
                totalBids,                                       // matches frontend auction.totalBids
                lowestBid: lowestBidDoc ? lowestBidDoc.bidPrice : null // matches auction.lowestBid display
            };
        }));

        res.json({
            success: true,
            auctions: auctionsWithBidCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get my auctions error:', error);
        res.status(500).json({
            message: 'Failed to fetch your auctions',
            error: error.message
        });
    }
};

// @desc    Cancel auction (before end time)
// @route   PUT /api/auctions/:id/cancel
// @access  Private (Kirana User who created it)
const cancelAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Check ownership
        if (auction.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this auction' });
        }

        // Check if auction can be cancelled
        if (auction.status !== 'open') {
            return res.status(400).json({ message: 'Only open auctions can be cancelled' });
        }

        if (new Date() > auction.endTime) {
            return res.status(400).json({ message: 'Auction has already ended' });
        }

        auction.status = 'cancelled';
        await auction.save();

        res.json({
            success: true,
            message: 'Auction cancelled successfully',
            auction
        });
    } catch (error) {
        console.error('Cancel auction error:', error);
        res.status(500).json({
            message: 'Failed to cancel auction',
            error: error.message
        });
    }
};

// @desc    Manually award an auction to a specific bid
// @route   PUT /api/auctions/:id/award/:bidId
// @access  Private (Kirana User who created it)
const awardAuctionManual = async (req, res) => {
    try {
        const { id: auctionId, bidId } = req.params;
        
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Check ownership
        if (auction.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to award this auction' });
        }

        // Check if auction can be awarded
        if (auction.status !== 'open') {
            return res.status(400).json({ message: 'Only open auctions can be awarded' });
        }

        const winningBid = await Bid.findById(bidId);
        if (!winningBid || winningBid.auctionId.toString() !== auctionId || winningBid.status !== 'active') {
            return res.status(404).json({ message: 'Valid active bid not found for this auction' });
        }

        // The body might specify which items to award if it's a partial award
        const { awardedItemIds } = req.body; // Array of item IDs to award to this bid

        // Determine which items to award
        let itemsToAward = [];
        if (auction.allowPartialBids && awardedItemIds && awardedItemIds.length > 0) {
            itemsToAward = awardedItemIds;
        } else {
            // Award all open items
            itemsToAward = auction.items.filter(i => i.status === 'open').map(i => i._id.toString());
        }

        if (itemsToAward.length === 0) {
            return res.status(400).json({ message: 'No open items to award' });
        }

        // Update each awarded item
        itemsToAward.forEach(itemId => {
            const item = auction.items.id(itemId);
            if (item && item.status === 'open') {
                item.status = 'awarded';
                item.winningBidId = winningBid._id;
                item.awardedTo = winningBid.sellerId;
            }
        });

        // Check if all items in the auction are now awarded or cancelled
        const allItemsClosed = auction.items.every(i => i.status !== 'open');
        if (allItemsClosed) {
            auction.status = 'awarded';
            auction.awardedAt = new Date();
            
            // Mark other bids as lost only if the entire auction is closed
            await Bid.updateMany(
                { auctionId: auction._id, _id: { $ne: winningBid._id }, status: 'active' },
                { $set: { status: 'lost' } }
            );
        }

        await auction.save();
        
        // Update winning bid status 
        winningBid.status = 'won';
        await winningBid.save();

        // Generate the Order/Bill automatically for the awarded items
        const order = await createAuctionOrder(auction._id, winningBid._id, itemsToAward);

        // Notify the winning seller
        await sendNotification(winningBid.sellerId, {
            type: 'auction_won',
            title: 'Auction Won! 🎉',
            message: `Congratulations! Your bid for ${itemsToAward.length} item(s) was accepted.`,
            data: { auctionId: auction._id, orderId: order._id }
        });

        res.json({
            success: true,
            message: 'Auction awarded successfully',
            auction,
            winningBid,
            orderId: order._id
        });

    } catch (error) {
        console.error('Award auction error:', error);
        res.status(500).json({
            message: 'Failed to award auction',
            error: error.message
        });
    }
};

// @desc    Auto-close expired auctions (Called by cron job)
// @route   POST /api/auctions/auto-close
// @access  Private (Admin/System)
const autoCloseExpiredAuctions = async (req, res) => {
    try {
        const expiredAuctions = await Auction.find({
            status: 'open',
            endTime: { $lt: new Date() }
        });

        const results = [];
        for (const auction of expiredAuctions) {
            // Find the winning bid (lowest price, fastest delivery)
            const winningBid = await Bid.findOne({ auctionId: auction._id, status: 'active' })
                .sort({ totalBidValue: 1, deliveryTimeline: 1 });

            if (winningBid) {
                auction.status = 'awarded';
                auction.winningBidId = winningBid._id;
                auction.winningSellerId = winningBid.sellerId;
                auction.winningBidId = winningBid._id;
                auction.awardedAt = new Date();
                
                // Set all open items to awarded
                auction.items.forEach(item => {
                    if (item.status === 'open') {
                        item.status = 'awarded';
                        item.winningBidId = winningBid._id;
                        item.awardedTo = winningBid.sellerId;
                    }
                });
                
                await auction.save();
                
                // Update winning bid status
                winningBid.status = 'won';
                await winningBid.save();
                
                // Mark other bids as lost
                await Bid.updateMany(
                    { auctionId: auction._id, _id: { $ne: winningBid._id }, status: 'active' },
                    { $set: { status: 'lost' } }
                );
                
                results.push({
                    auctionId: auction._id,
                    winner: winningBid.sellerId,
                    price: winningBid.totalBidValue
                });
            } else {
                auction.status = 'expired';
                await auction.save();
                results.push({
                    auctionId: auction._id,
                    winner: null,
                    message: 'No bids received'
                });
            }
        }

        res.json({
            success: true,
            message: `${expiredAuctions.length} auctions processed`,
            results
        });
    } catch (error) {
        console.error('Auto-close auctions error:', error);
        res.status(500).json({
            message: 'Failed to process expired auctions',
            error: error.message
        });
    }
};

module.exports = {
    createAuction,
    getOpenAuctions,
    getAuctionById,
    getMyAuctions,
    cancelAuction,
    awardAuctionManual,
    autoCloseExpiredAuctions
};