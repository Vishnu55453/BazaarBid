const cron = require('node-cron');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { createAuctionOrder } = require('../services/orderService');

const startAuctionWorker = () => {
    console.log('🕐 Auction worker started - checking for expired auctions every minute');
    
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            
            // Find auctions that have ended but not yet processed
            const expiredAuctions = await Auction.find({
                status: 'open',
                endTime: { $lt: now }
            });
            
            if (expiredAuctions.length === 0) return;
            
            console.log(`📦 Processing ${expiredAuctions.length} expired auctions...`);
            
            for (const auction of expiredAuctions) {
                try {
                    // Find winning bid (lowest price, fastest delivery)
                    const winningBid = await Bid.findOne({ 
                        auctionId: auction._id, 
                        status: 'active' 
                    }).sort({ bidPrice: 1, deliveryTimeline: 1 });
                    
                    if (winningBid) {
                        // Award the auction
                        auction.status = 'awarded';
                        auction.winningBidId = winningBid._id;
                        auction.winningSellerId = winningBid.sellerId;
                        auction.winningPrice = winningBid.bidPrice;
                        auction.winningPricePerUnit = winningBid.pricePerUnit;
                        auction.awardedAt = new Date();
                        await auction.save();
                        
                        // Update winning bid status
                        winningBid.status = 'won';
                        await winningBid.save();
                        
                        // Mark other bids as lost
                        await Bid.updateMany(
                            { 
                                auctionId: auction._id, 
                                _id: { $ne: winningBid._id }, 
                                status: 'active' 
                            },
                            { $set: { status: 'lost' } }
                        );
                        
                        // CREATE ORDER FROM AUCTION WIN (using service)
                        const order = await createAuctionOrder(auction._id, winningBid._id);
                        
                        console.log(`✅ Auction ${auction._id} awarded to seller ${winningBid.sellerId} at ₹${winningBid.bidPrice}`);
                        console.log(`📦 Order created: ${order.orderNumber}`);
                        
                    } else {
                        // No bids received
                        auction.status = 'expired';
                        await auction.save();
                        console.log(`❌ Auction ${auction._id} expired with no bids`);
                    }
                } catch (auctionError) {
                    console.error(`Error processing auction ${auction._id}:`, auctionError.message);
                    // Continue with next auction
                }
            }
        } catch (error) {
            console.error('Auction worker error:', error);
        }
    });
};

module.exports = startAuctionWorker;