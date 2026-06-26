const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    reason: {
        type: String,
        required: true,
        enum: ['Payment Default', 'Quality Issue', 'No Show / Ghosting', 'Abusive Behavior', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'RESOLVED', 'REJECTED'],
        default: 'PENDING'
    },
    adminNotes: {
        type: String
    },
    strikeIssued: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
