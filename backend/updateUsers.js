const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const updateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbid');
        console.log('Connected to DB');

        // Update Retailer (buyer)
        const retailer = await User.findOneAndUpdate(
            { email: 'vishnugawad90@gmail.com' },
            {
                $set: {
                    'subscription.planCode': 'premium_buyer',
                    'subscription.status': 'active',
                    'subscription.endDate': new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
            },
            { new: true }
        );
        console.log('Updated Retailer:', retailer ? retailer.email + ' -> ' + retailer.subscription.planCode : 'Not found');

        // Update Seller
        const seller = await User.findOneAndUpdate(
            { email: 'vishnugawade900@gmail.com' },
            {
                $set: {
                    'subscription.planCode': 'premium_seller',
                    'subscription.status': 'active',
                    'subscription.endDate': new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    'bigMarketProfile.verified': true // Also verifying them so they can test verified features
                }
            },
            { new: true }
        );
        console.log('Updated Seller:', seller ? seller.email + ' -> ' + seller.subscription.planCode : 'Not found');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateUsers();

// Okay lets also discuss something about the seriousness of the platform . 
// now here we have added the features such as users are getting registered seller , 
// buyer and retailer , then the retailer are placing the auction , seller are placing bid , 
// then award . here we need to add something seriousness so that users/people are not fooling 
// anyone here on the platform and second also not just coming on the platform for just getting names 
// of the vendors and all and then do the business outside the platform . main thing we need to focus on is 
// the after award workflow , the retailer 
