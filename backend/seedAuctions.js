const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const User = require('./src/models/User');
const Auction = require('./src/models/Auction');

async function seedAuctions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'vishnugawad90@gmail.com' });
        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        const buyerId = user._id;
        const address = user.kiranaProfile?.asBuyer?.deliveryAddresses?.[0] || {
            shopName: user.kiranaProfile?.asSeller?.shopName || 'Shop',
            area: user.location?.area || 'Area',
            city: user.location?.city || 'City',
            pincode: user.location?.pincode || '400001'
        };

        // Drop existing open auctions for this user to avoid duplicates
        await Auction.deleteMany({ buyerId, status: 'open' });

        const now = new Date();
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + 7); // 7 days auction time

        const commonProps = {
            buyerId,
            buyerType: 'kirana_user',
            preferredMarket: 'Vashi APMC', // Generic market since we don't have the real IDs
            deliveryAddress: address,
            deliveryTimeline: 7, // 7 days delivery timeline too
            startTime: now,
            endTime: endTime,
            autoAward: false,
            verifiedSellersOnly: false,
            status: 'open'
        };

        const auctions = [
            // Single Item 1
            {
                ...commonProps,
                advancePercent: 0, // 0% Advance (100% COD)
                items: [{
                    productName: 'Premium Basmati Rice - 50kg Bags',
                    category: '6661d2d3c90a191497cdfc2e', // Just placeholder ID or string depending on schema.
                    // Let's get the actual category later or use string. The schema says category is String!
                    quantity: 50,
                    unit: 'kg',
                    qualitySpecs: { grade: 'Premium', packaging: '50kg Bag' },
                }]
            },
            // Single Item 2
            {
                ...commonProps,
                advancePercent: 20, // 20% Advance
                items: [{
                    productName: 'Refined Sunflower Oil',
                    category: '6661d2d3c90a191497cdfc2f',
                    quantity: 100,
                    unit: 'litre',
                    qualitySpecs: { grade: 'Standard', packaging: '15L Tin' },
                }]
            },
            // Single Item 3
            {
                ...commonProps,
                advancePercent: 100, // 100% Advance
                items: [{
                    productName: 'Tata Salt',
                    category: '6661d2d3c90a191497cdfc30',
                    quantity: 200,
                    unit: 'kg',
                    qualitySpecs: { grade: 'A Grade', packaging: '1kg Packet' },
                }]
            },
            // Multi Item 1
            {
                ...commonProps,
                advancePercent: 10, // 10% Advance
                allowPartialBids: true,
                items: [
                    {
                        productName: 'Toor Dal (Premium)',
                        category: '6661d2d3c90a191497cdfc2e',
                        quantity: 100,
                        unit: 'kg',
                        qualitySpecs: { grade: 'Premium', packaging: '25kg Bag' },
                    },
                    {
                        productName: 'Chana Dal (Premium)',
                        category: '6661d2d3c90a191497cdfc2e',
                        quantity: 50,
                        unit: 'kg',
                        qualitySpecs: { grade: 'Premium', packaging: '25kg Bag' },
                    }
                ]
            },
            // Multi Item 2
            {
                ...commonProps,
                advancePercent: 50, // 50% Advance
                allowPartialBids: false,
                items: [
                    {
                        productName: 'Red Chilli Powder',
                        category: '6661d2d3c90a191497cdfc31',
                        quantity: 20,
                        unit: 'kg',
                        qualitySpecs: { grade: 'Premium', packaging: '1kg Pouch' },
                    },
                    {
                        productName: 'Turmeric Powder',
                        category: '6661d2d3c90a191497cdfc31',
                        quantity: 15,
                        unit: 'kg',
                        qualitySpecs: { grade: 'Premium', packaging: '1kg Pouch' },
                    },
                    {
                        productName: 'Cumin Seeds',
                        category: '6661d2d3c90a191497cdfc31',
                        quantity: 10,
                        unit: 'kg',
                        qualitySpecs: { grade: 'Premium', packaging: '500g Pouch' },
                    }
                ]
            }
        ];

        // Before creating, I need to fetch valid category and market IDs.
        const Category = require('./src/models/Category');
        const MarketMaster = require('./src/models/MarketMaster');
        const cats = await Category.find();
        const markets = await MarketMaster.find();
        
        let mktId = markets.length > 0 ? markets[0]._id.toString() : 'Vashi APMC';
        
        for (let i = 0; i < auctions.length; i++) {
            auctions[i].preferredMarket = mktId;
            // set dynamic categories
            for (let j = 0; j < auctions[i].items.length; j++) {
               const catIdx = (i + j) % (cats.length > 0 ? cats.length : 1);
               auctions[i].items[j].category = cats.length > 0 ? cats[catIdx].categoryId || cats[catIdx]._id.toString() : '6661d2d3c90a191497cdfc2e';
            }
        }

        for (const a of auctions) {
            await Auction.create(a);
        }

        console.log('Successfully created 5 auctions');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAuctions();
