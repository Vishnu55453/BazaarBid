const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

// Valid GST format: 22AAAAA0000A1Z5
const generateGST = (stateCode) => {
    return `${stateCode}ABCDE1234F1Z5`;
};

const sellers = [
    {
        name: 'Vashi Fresh Wholesale',
        email: 'vashifresh@bazaarbid.com',
        phone: '9876500001',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Vashi APMC',
            shopNumber: 'A-101',
            shopName: 'Vashi Fresh Wholesale',
            verified: true,
            gstNumber: generateGST('27')
        },
        location: { city: 'Mumbai', pincode: '400703' },
        subscription: { planCode: 'premium_seller', status: 'active' }
    },
    {
        name: 'Byculla Veggies',
        email: 'bycullaveg@bazaarbid.com',
        phone: '9876500002',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Byculla Market',
            shopNumber: 'B-205',
            shopName: 'Byculla Veggies',
            verified: true,
            gstNumber: generateGST('27')
        },
        location: { city: 'Mumbai', pincode: '400027' },
        subscription: { planCode: 'free_seller', status: 'active' }
    },
    {
        name: 'Dadar Floral & Produce',
        email: 'dadarproduce@bazaarbid.com',
        phone: '9876500003',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Dadar Market',
            shopNumber: 'C-55',
            shopName: 'Dadar Floral & Produce',
            verified: true,
            gstNumber: generateGST('27')
        },
        location: { city: 'Mumbai', pincode: '400028' },
        subscription: { planCode: 'premium_seller', status: 'active' }
    },
    {
        name: 'Crawford Wholesale',
        email: 'crawford@bazaarbid.com',
        phone: '9876500004',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Crawford Market',
            shopNumber: 'D-12',
            shopName: 'Crawford Wholesale',
            verified: false,
            gstNumber: generateGST('27')
        },
        location: { city: 'Mumbai', pincode: '400001' },
        subscription: { planCode: 'free_seller', status: 'active' }
    },
    {
        name: 'APMC Onion Traders',
        email: 'apmconion@bazaarbid.com',
        phone: '9876500005',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Vashi APMC',
            shopNumber: 'E-404',
            shopName: 'APMC Onion Traders',
            verified: true,
            gstNumber: generateGST('27')
        },
        location: { city: 'Navi Mumbai', pincode: '400705' },
        subscription: { planCode: 'premium_seller', status: 'active' }
    },
    {
        name: 'Mumbai Fruit Co',
        email: 'mumbaifruit@bazaarbid.com',
        phone: '9876500006',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Vashi APMC',
            shopNumber: 'F-19',
            shopName: 'Mumbai Fruit Co',
            verified: true,
            gstNumber: generateGST('27')
        },
        location: { city: 'Navi Mumbai', pincode: '400703' },
        subscription: { planCode: 'free_seller', status: 'active' }
    },
    {
        name: 'Kalyan Agri Wholesalers',
        email: 'kalyanagri@bazaarbid.com',
        phone: '9876500007',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Kalyan Market',
            shopNumber: 'G-77',
            shopName: 'Kalyan Agri Wholesalers',
            verified: false,
            gstNumber: generateGST('27')
        },
        location: { city: 'Kalyan', pincode: '421301' },
        subscription: { planCode: 'free_seller', status: 'active' }
    },
    {
        name: 'Premium Spices Vashi',
        email: 'premiumspices@bazaarbid.com',
        phone: '9876500008',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Vashi APMC',
            shopNumber: 'H-88',
            shopName: 'Premium Spices Vashi',
            verified: true,
            gstNumber: generateGST('27')
        },
        location: { city: 'Navi Mumbai', pincode: '400703' },
        subscription: { planCode: 'premium_seller', status: 'active' }
    },
    {
        name: 'Borivali Produce Depot',
        email: 'borivaliproduce@bazaarbid.com',
        phone: '9876500009',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Borivali Market',
            shopNumber: 'I-02',
            shopName: 'Borivali Produce Depot',
            verified: false,
            gstNumber: generateGST('27')
        },
        location: { city: 'Mumbai', pincode: '400092' },
        subscription: { planCode: 'free_seller', status: 'active' }
    },
    {
        name: 'Global Exotics Wholesale',
        email: 'globalexotics@bazaarbid.com',
        phone: '9876500010',
        password: 'password123',
        role: 'big_market_seller',
        bigMarketProfile: {
            marketName: 'Vashi APMC',
            shopNumber: 'J-99',
            shopName: 'Global Exotics Wholesale',
            verified: true,
            gstNumber: generateGST('27')
        },
        location: { city: 'Navi Mumbai', pincode: '400703' },
        subscription: { planCode: 'premium_seller', status: 'active' }
    }
];

const seedSellers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbid');
        console.log('Connected to DB');

        for (const seller of sellers) {
            const exists = await User.findOne({ email: seller.email });
            if (exists) {
                // Update to add GST, City, and Pincode
                await User.findOneAndUpdate(
                    { email: seller.email },
                    { 
                        $set: { 
                            'bigMarketProfile.gstNumber': seller.bigMarketProfile.gstNumber,
                            'location.city': seller.location.city,
                            'location.pincode': seller.location.pincode
                        } 
                    }
                );
                console.log(`Updated seller with GST & Location: ${seller.email}`);
            } else {
                const newUser = new User(seller);
                await newUser.save();
                console.log(`Created seller: ${seller.email}`);
            }
        }

        console.log('Finished updating sellers!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding sellers:', error);
        process.exit(1);
    }
};

seedSellers();
