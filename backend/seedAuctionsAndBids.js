const mongoose = require('mongoose');
const User = require('./src/models/User');
const Auction = require('./src/models/Auction');
const Bid = require('./src/models/Bid');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbid');
        console.log('Connected to DB');

        // 1. Get Buyer
        const buyer = await User.findOne({ email: 'vishnugawad90@gmail.com' });
        if (!buyer) {
            console.log('Buyer vishnugawad90@gmail.com not found!');
            process.exit(1);
        }

        // 2. Get Sellers
        const sellers = await User.find({ role: 'big_market_seller' });
        if (sellers.length === 0) {
            console.log('No big market sellers found!');
            process.exit(1);
        }

        console.log(`Found ${sellers.length} sellers.`);

        // 3. Create Auctions
        const auction1 = new Auction({
            buyerId: buyer._id,
            buyerType: 'kirana_user',
            items: [
                {
                    productName: 'Onions (Nasik Premium)',
                    category: 'Vegetables',
                    quantity: 500,
                    unit: 'kg',
                    qualitySpecs: { grade: 'Premium', freshness: 'Today', packaging: 'Bag' },
                    budgetRange: { min: 20, max: 35 }
                }
            ],
            preferredMarket: 'Vashi APMC',
            deliveryAddress: {
                shopName: buyer.kiranaProfile?.asSeller?.shopName || 'Retail Shop',
                area: 'Andheri',
                city: 'Mumbai',
                pincode: '400053'
            },
            deliveryTimeline: 2,
            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            autoAward: false, // NO auto award
            verifiedSellersOnly: false, // ALL sellers allowed
            status: 'open'
        });

        const auction2 = new Auction({
            buyerId: buyer._id,
            buyerType: 'kirana_user',
            items: [
                {
                    productName: 'Tomatoes (Hybrid)',
                    category: 'Vegetables',
                    quantity: 200,
                    unit: 'kg',
                    qualitySpecs: { grade: 'A', freshness: 'Today', packaging: 'Box' },
                    budgetRange: { min: 40, max: 60 }
                }
            ],
            preferredMarket: 'Byculla Market',
            deliveryAddress: {
                shopName: buyer.kiranaProfile?.asSeller?.shopName || 'Retail Shop',
                area: 'Andheri',
                city: 'Mumbai',
                pincode: '400053'
            },
            deliveryTimeline: 1,
            endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            autoAward: false, // NO auto award
            verifiedSellersOnly: false, // ALL sellers allowed
            status: 'open'
        });

        await auction1.save();
        await auction2.save();
        console.log('Created 2 Auctions.');

        // 4. Place Bids for Auction 1
        console.log('Placing bids for Auction 1 (Onions)...');
        for (const seller of sellers) {
            const price = Math.floor(Math.random() * (32 - 22 + 1)) + 22; // 22 to 32
            const bid = new Bid({
                auctionId: auction1._id,
                sellerId: seller._id,
                sellerType: 'big_market_seller',
                bidItems: [
                    {
                        itemId: auction1.items[0]._id,
                        pricePerUnit: price,
                        quantity: 500,
                        totalPrice: price * 500
                    }
                ],
                totalBidValue: price * 500,
                deliveryTimeline: Math.floor(Math.random() * 2) + 1,
                deliveryCharges: Math.floor(Math.random() * 200),
                freeDelivery: Math.random() > 0.5,
                sourceMarket: seller.bigMarketProfile.marketName,
                status: 'active'
            });
            await bid.save();
        }

        // 5. Place Bids for Auction 2
        console.log('Placing bids for Auction 2 (Tomatoes)...');
        for (const seller of sellers) {
            const price = Math.floor(Math.random() * (58 - 42 + 1)) + 42; // 42 to 58
            const bid = new Bid({
                auctionId: auction2._id,
                sellerId: seller._id,
                sellerType: 'big_market_seller',
                bidItems: [
                    {
                        itemId: auction2.items[0]._id,
                        pricePerUnit: price,
                        quantity: 200,
                        totalPrice: price * 200
                    }
                ],
                totalBidValue: price * 200,
                deliveryTimeline: 1,
                deliveryCharges: Math.floor(Math.random() * 100),
                freeDelivery: Math.random() > 0.5,
                sourceMarket: seller.bigMarketProfile.marketName,
                status: 'active'
            });
            await bid.save();
        }

        // Update Auction bid summaries
        const bids1 = await Bid.find({ auctionId: auction1._id });
        auction1.totalBids = bids1.length;
        auction1.lowestBid = Math.min(...bids1.map(b => b.totalBidValue));
        auction1.averageBid = bids1.reduce((acc, b) => acc + b.totalBidValue, 0) / bids1.length;
        await auction1.save();

        const bids2 = await Bid.find({ auctionId: auction2._id });
        auction2.totalBids = bids2.length;
        auction2.lowestBid = Math.min(...bids2.map(b => b.totalBidValue));
        auction2.averageBid = bids2.reduce((acc, b) => acc + b.totalBidValue, 0) / bids2.length;
        await auction2.save();

        // Update Rankings
        await Bid.updateRankings(auction1._id);
        await Bid.updateRankings(auction2._id);

        console.log('Finished creating auctions and bids!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedData();
