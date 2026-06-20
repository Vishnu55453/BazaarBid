const Order = require('../models/Order');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

// Helper function to calculate platform commission
const calculateCommission = (subtotal, sellerRole) => {
    // SaaS Model: Transaction fees are completely eliminated!
    // Platform revenue is now generated exclusively through Subscription Plans.
    return 0;
};

// @desc    Create order from auction win
// @access  Called by auction worker or controller
const createAuctionOrder = async (auctionId, winningBidId, awardedItemIds = null) => {
    try {
        const auction = await Auction.findById(auctionId);
        const winningBid = await Bid.findById(winningBidId).populate('sellerId');

        if (!auction) {
            throw new Error(`Auction ${auctionId} not found`);
        }

        if (!winningBid) {
            throw new Error(`Winning bid ${winningBidId} not found`);
        }

        const buyer = await User.findById(auction.buyerId);
        const seller = winningBid.sellerId;

        if (!buyer || !seller) {
            throw new Error('Buyer or seller not found');
        }

        // Determine which items to include in the order
        let orderItems = [];
        let subtotal = 0;

        if (awardedItemIds && awardedItemIds.length > 0) {
            // Partial award: only include the awarded items
            awardedItemIds.forEach(itemId => {
                const auctionItem = auction.items.find(i => i._id.toString() === itemId.toString());
                const bidItem = winningBid.bidItems.find(i => i.itemId.toString() === itemId.toString());
                
                if (auctionItem && bidItem) {
                    orderItems.push({
                        productName: auctionItem.productName,
                        quantity: bidItem.quantity,
                        unit: auctionItem.unit,
                        pricePerUnit: bidItem.pricePerUnit,
                        totalPrice: bidItem.totalPrice
                    });
                    subtotal += bidItem.totalPrice;
                }
            });
        } else {
            // Full award: include all items from the bid
            winningBid.bidItems.forEach(bidItem => {
                const auctionItem = auction.items.find(i => i._id.toString() === bidItem.itemId.toString());
                if (auctionItem) {
                    orderItems.push({
                        productName: auctionItem.productName,
                        quantity: bidItem.quantity,
                        unit: auctionItem.unit,
                        pricePerUnit: bidItem.pricePerUnit,
                        totalPrice: bidItem.totalPrice
                    });
                    subtotal += bidItem.totalPrice;
                }
            });
        }

        const deliveryCharges = winningBid.deliveryCharges || 0;
        const platformCommission = calculateCommission(subtotal, seller.role);
        
        // BULK DISCOUNT LOGIC:
        // Discount is only valid if all auction items are awarded to this seller.
        let discountPercent = 0;
        let discountAmount = 0;
        if (orderItems.length === auction.items.length && winningBid.discountOffered > 0) {
            discountPercent = winningBid.discountOffered;
            discountAmount = Math.round((subtotal * discountPercent) / 100);
        }

        const totalAmount = subtotal - discountAmount + deliveryCharges + platformCommission;

        // Create order
        const order = new Order({
            orderType: 'auction_won',
            auctionId: auction._id,
            bidId: winningBid._id,
            buyerId: auction.buyerId,
            buyerRole: 'kirana_user',
            sellerId: winningBid.sellerId,
            sellerRole: 'big_market_seller',
            items: orderItems,
            subtotal,
            deliveryCharges,
            platformCommission,
            discount: discountAmount, // Storing the actual currency amount subtracted
            tax: 0,
            totalAmount,
            paymentMethod: 'bank_transfer', // Will be updated by buyer
            deliveryAddress: auction.deliveryAddress,
            deliveryTimeline: winningBid.deliveryTimeline,
            status: 'pending',
            platformEarnings: platformCommission,
            sellerEarnings: subtotal - discountAmount - platformCommission
        });

        await order.save();

        // We don't overwrite orderId on the root auction object since partial bids generate multiple orders.
        // The controller will save the awardedTo and winningBidId at the item level.
        
        // Update winning bid status if all items are awarded, 
        // but for safety we'll let the controller handle it or just set it to 'won' anyway 
        // since the bid was at least partially won.

        // Update winning bid status (already set to 'won' in worker, but ensure)
        winningBid.status = 'won';
        await winningBid.save();

        // ℹ️  Kirana buyer's inventory is populated when the seller marks
        //    the order as 'delivered' — see orderController.updateOrderStatus.

        return order;
    } catch (error) {
        console.error('Create auction order error:', error);
        throw error;
    }
};

module.exports = {
    createAuctionOrder
};