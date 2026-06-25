const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
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

// @desc    Place a bid on an auction
// @route   POST /api/bids/:auctionId
// @access  Private (Big Market Seller only)
const placeBid = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { auctionId } = req.params;
        const { bidItems, deliveryTimeline, notes, freeDelivery, qualityGuarantee, discountOffered, deliveryCharges } = req.body;

        // Check if auction exists
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Check if auction is open
        if (auction.status !== 'open' || new Date() > auction.endTime) {
            return res.status(400).json({ message: 'This auction is no longer open for bids' });
        }

        // Check rating requirement
        const seller = await User.findById(req.user.id);
        const sellerRating = seller?.rating?.average || 0;
        if (auction.minRatingRequired && sellerRating < auction.minRatingRequired) {
            return res.status(403).json({ 
                message: `This auction requires a minimum rating of ${auction.minRatingRequired} stars. Your current rating is ${sellerRating}.` 
            });
        }

        // Check verified requirement
        if (auction.verifiedSellersOnly && !seller?.bigMarketProfile?.verified) {
            return res.status(403).json({
                message: 'This auction only accepts bids from verified sellers. Please complete your KYC verification.'
            });
        }

        // Validate delivery charges
        if (!freeDelivery && (deliveryCharges === undefined || deliveryCharges === null || Number(deliveryCharges) < 0)) {
            return res.status(400).json({ message: 'Delivery charges are required and must be a valid amount when free delivery is not offered.' });
        }
        
        const finalDeliveryCharges = freeDelivery ? 0 : Number(deliveryCharges);

        // Validate bid items
        if (!bidItems || !Array.isArray(bidItems) || bidItems.length === 0) {
            return res.status(400).json({ message: 'Bid items are required' });
        }

        // Check for partial bids rule
        if (!auction.allowPartialBids && bidItems.length !== auction.items.length) {
            return res.status(400).json({ message: 'This auction requires bidding on all items. Partial bids are not allowed.' });
        }

        // Process and validate items
        let totalBidValue = 0;
        const processedBidItems = [];

        for (const bItem of bidItems) {
            const auctionItem = auction.items.id(bItem.itemId);
            if (!auctionItem || auctionItem.status !== 'open') {
                return res.status(400).json({ message: `Item ${bItem.itemId} is not open or not found in this auction.` });
            }

            const totalPrice = bItem.pricePerUnit * auctionItem.quantity;
            totalBidValue += totalPrice;

            processedBidItems.push({
                itemId: auctionItem._id,
                pricePerUnit: bItem.pricePerUnit,
                quantity: auctionItem.quantity,
                totalPrice
            });
        }

        // SaaS Check: Discount Features
        const features = await getUserPlanFeatures(req.user);
        
        // Only allow discount if all items are bid on AND the plan allows it
        const finalDiscount = (processedBidItems.length === auction.items.length && features.canOfferDiscounts) 
            ? (discountOffered || 0) 
            : 0;

        // Check if user already bid
        const existingBid = await Bid.findOne({ auctionId, sellerId: req.user.id });
        if (existingBid) {
            existingBid.bidItems = processedBidItems;
            existingBid.totalBidValue = totalBidValue;
            existingBid.deliveryTimeline = deliveryTimeline;
            existingBid.additionalNotes = notes;
            if (freeDelivery !== undefined) {
                existingBid.freeDelivery = freeDelivery;
                existingBid.deliveryCharges = finalDeliveryCharges;
            }
            if (qualityGuarantee !== undefined) existingBid.qualityGuarantee = qualityGuarantee;
            existingBid.discountOffered = finalDiscount;
            await existingBid.save();

            // Update rankings so retail portal shows correct ordering
            await Bid.updateRankings(auctionId);

            // Notify auction creator
            await sendNotification(auction.buyerId, {
                type: 'bid_placed',
                message: `A seller updated their bid to ₹${totalBidValue} on your auction.`,
                data: { auctionId }
            });

            return res.json({
                success: true,
                message: 'Bid updated successfully',
                bid: existingBid
            });
        }

        // --- NEW BID ---
        // SaaS Limit Check
        const sellerUser = await User.findById(req.user.id);
        const usage = sellerUser.usageMetrics || { bidsThisMonth: 0 };
        if (features.maxBidsPerMonth !== -1 && usage.bidsThisMonth >= features.maxBidsPerMonth) {
            return res.status(403).json({
                message: `Limit reached (${features.maxBidsPerMonth} bids/month). Please upgrade your subscription to place unlimited bids.`,
                requiresUpgrade: true
            });
        }

        // Create new bid
        const bid = new Bid({
            auctionId,
            sellerId: req.user.id,
            bidItems: processedBidItems,
            totalBidValue,
            deliveryTimeline,
            additionalNotes: notes,
            freeDelivery: freeDelivery || false,
            deliveryCharges: finalDeliveryCharges,
            qualityGuarantee: qualityGuarantee || false,
            discountOffered: finalDiscount,
            status: 'active'
        });

        await bid.save();

        // Update rankings so retail portal shows correct ordering
        await Bid.updateRankings(auctionId);

        // Increment usage
        sellerUser.usageMetrics = sellerUser.usageMetrics || { bidsThisMonth: 0 };
        sellerUser.usageMetrics.bidsThisMonth = (sellerUser.usageMetrics.bidsThisMonth || 0) + 1;
        await sellerUser.save();

        // Notify auction creator
        await sendNotification(auction.buyerId, {
            type: 'bid_placed',
            title: 'New Bid Received! 🔥',
            message: `A seller placed a bid of ₹${totalBidValue} on your auction.`,
            data: { auctionId }
        });

        res.status(201).json({
            success: true,
            message: 'Bid placed successfully',
            bid
        });
    } catch (error) {
        console.error('Place bid error:', error);
        res.status(500).json({
            message: 'Failed to place bid',
            error: error.message
        });
    }
};

// @desc    Get bids placed by the current seller
// @route   GET /api/bids/my-bids
// @access  Private (Big Market Seller)
const getMyBids = async (req, res) => {
    try {
        const { status } = req.query;
        
        const filter = { sellerId: req.user.id };
        if (status) {
            filter.status = status;
        }

        let bids = await Bid.find(filter)
            .populate('auctionId')
            .sort({ createdAt: -1 })
            .lean();

        // ANONYMOUS BIDDING: Mask retailer identity if not won
        bids = bids.map(bid => {
            if (bid.status !== 'won' && bid.auctionId && bid.auctionId.deliveryAddress) {
                bid.auctionId.deliveryAddress.shopName = 'Verified Retailer';
            }
            return bid;
        });

        // Calculate some basic stats
        const allBids = await Bid.find({ sellerId: req.user.id });
        const stats = {
            totalBids: allBids.length,
            activeBids: allBids.filter(b => b.status === 'active').length,
            wonAuctions: allBids.filter(b => b.status === 'won').length,
            totalRevenue: 0 // Would require order linking to calculate exact revenue
        };

        res.json({
            success: true,
            bids,
            stats
        });
    } catch (error) {
        console.error('Get my bids error:', error);
        res.status(500).json({
            message: 'Failed to fetch bids',
            error: error.message
        });
    }
};

module.exports = {
    placeBid,
    getMyBids
};
