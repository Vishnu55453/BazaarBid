const mongoose = require('mongoose');
require('dotenv').config();

const MarketMaster = require('../src/models/MarketMaster');
const CategoryMaster = require('../src/models/CategoryMaster');

const markets = [
    {
        marketId: 'vashi_apmc_veg',
        name: 'Vashi APMC Vegetable Market',
        city: 'Navi Mumbai',
        pincode: '400705',
        type: 'Vegetables'
    },
    {
        marketId: 'vashi_apmc_fruit',
        name: 'Vashi APMC Fruit Market',
        city: 'Navi Mumbai',
        pincode: '400705',
        type: 'Fruits'
    },
    {
        marketId: 'vashi_apmc_dryfruit',
        name: 'Vashi APMC Dry Fruit Market',
        city: 'Navi Mumbai',
        pincode: '400705',
        type: 'Dry Fruits'
    },
    {
        marketId: 'vashi_apmc_grains',
        name: 'Vashi APMC Grains & Spices',
        city: 'Navi Mumbai',
        pincode: '400705',
        type: 'Grains'
    },
    {
        marketId: 'byculla_fruit',
        name: 'Byculla Wholesale Fruit Market',
        city: 'Mumbai',
        pincode: '400027',
        type: 'Fruits'
    },
    {
        marketId: 'byculla_veg',
        name: 'Byculla Vegetable Market',
        city: 'Mumbai',
        pincode: '400027',
        type: 'Vegetables'
    },
    {
        marketId: 'dadar_flower_veg',
        name: 'Dadar Flower & Vegetable Market',
        city: 'Mumbai',
        pincode: '400028',
        type: 'Mixed'
    },
    {
        marketId: 'crawford_market',
        name: 'Crawford Market',
        city: 'Mumbai',
        pincode: '400001',
        type: 'Mixed'
    },
    {
        marketId: 'other',
        name: 'Other (Specify Locally)',
        city: 'Any',
        pincode: '000000',
        type: 'Other'
    }
];

const categories = [
    {
        categoryId: 'vegetables',
        name: 'Vegetables',
        subCategories: ['Leafy Vegetables', 'Root Vegetables', 'Gourds & Pumpkins', 'Onions & Potatoes', 'Exotic Vegetables']
    },
    {
        categoryId: 'fruits',
        name: 'Fruits',
        subCategories: ['Citrus Fruits', 'Berries', 'Tropical Fruits', 'Apples & Pears', 'Melons']
    },
    {
        categoryId: 'grains_pulses',
        name: 'Grains & Pulses',
        subCategories: ['Rice', 'Wheat', 'Dals & Pulses', 'Millets', 'Flours']
    },
    {
        categoryId: 'spices',
        name: 'Spices & Herbs',
        subCategories: ['Whole Spices', 'Powdered Spices', 'Fresh Herbs', 'Dry Herbs']
    },
    {
        categoryId: 'dry_fruits',
        name: 'Dry Fruits & Nuts',
        subCategories: ['Almonds', 'Cashews', 'Raisins', 'Walnuts', 'Dates', 'Mixed Nuts']
    },
    {
        categoryId: 'dairy',
        name: 'Dairy Products',
        subCategories: ['Milk', 'Paneer', 'Cheese', 'Butter & Ghee', 'Curd']
    }
];

const seedMasters = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing masters to avoid duplicates
        await MarketMaster.deleteMany({});
        await CategoryMaster.deleteMany({});
        console.log('🗑️ Cleared existing Master collections');

        // Insert new data
        await MarketMaster.insertMany(markets);
        await CategoryMaster.insertMany(categories);

        console.log('🎉 Successfully seeded Master Data!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedMasters();
