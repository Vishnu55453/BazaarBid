const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// Load env vars
dotenv.config();

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const plans = [
            {
                planCode: 'free_buyer',
                name: 'Free Retailer',
                pricePerMonth: 0,
                features: {
                    maxAuctionsPerMonth: 2,
                    maxBidsPerMonth: 0,
                    canViewCompetitors: false,
                    canOfferDiscounts: false,
                    canFilterVerifiedSellers: false,
                    canViewAnalytics: false,
                    hasPremiumBadge: false,
                    canViewDemandHeatmaps: false
                }
            },
            {
                planCode: 'premium_buyer',
                name: 'Premium Retailer',
                pricePerMonth: 499,
                features: {
                    maxAuctionsPerMonth: -1, // Unlimited
                    maxBidsPerMonth: 0,
                    canViewCompetitors: false,
                    canOfferDiscounts: false,
                    canFilterVerifiedSellers: true,
                    canViewAnalytics: true,
                    hasPremiumBadge: false,
                    canViewDemandHeatmaps: false
                }
            },
            {
                planCode: 'free_seller',
                name: 'Free Supplier',
                pricePerMonth: 0,
                features: {
                    maxAuctionsPerMonth: 0,
                    maxBidsPerMonth: 5,
                    canViewCompetitors: false,
                    canOfferDiscounts: false,
                    canFilterVerifiedSellers: false,
                    canViewAnalytics: false,
                    hasPremiumBadge: false,
                    canViewDemandHeatmaps: false
                }
            },
            {
                planCode: 'premium_seller',
                name: 'Premium Supplier',
                pricePerMonth: 999,
                features: {
                    maxAuctionsPerMonth: 0,
                    maxBidsPerMonth: -1, // Unlimited
                    canViewCompetitors: true,
                    canOfferDiscounts: true,
                    canFilterVerifiedSellers: false,
                    canViewAnalytics: false,
                    hasPremiumBadge: true,
                    canViewDemandHeatmaps: true
                }
            }
        ];

        for (const plan of plans) {
            await SubscriptionPlan.findOneAndUpdate(
                { planCode: plan.planCode },
                plan,
                { upsert: true, new: true }
            );
        }

        console.log('Subscription Plans Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding plans:', error);
        process.exit(1);
    }
};

seedPlans();
