const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Submit a new report
// @route   POST /api/reports
// @access  Private
const submitReport = async (req, res) => {
    try {
        const { reportedUserId, auctionId, orderId, reason, description } = req.body;

        if (req.user.id === reportedUserId) {
            return res.status(400).json({ message: 'You cannot report yourself' });
        }

        const report = new Report({
            reporter: req.user.id,
            reportedUser: reportedUserId,
            auction: auctionId,
            order: orderId,
            reason,
            description
        });

        await report.save();

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. Our team will review it.',
            report
        });
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ message: 'Failed to submit report', error: error.message });
    }
};

// @desc    Admin: Resolve a report and optionally issue a strike
// @route   PUT /api/reports/:id/resolve
// @access  Private (Admin only)
const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, issueStrike } = req.body; // status: RESOLVED or REJECTED

        const report = await Report.findById(id).populate('reportedUser');
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.status !== 'PENDING') {
            return res.status(400).json({ message: 'Report is already processed' });
        }

        report.status = status;
        report.adminNotes = adminNotes;

        if (status === 'RESOLVED' && issueStrike && report.reportedUser) {
            const user = await User.findById(report.reportedUser._id);
            if (user && !user.isBanned) {
                user.strikes += 1;
                // Reduce trust score (e.g. -33 per strike)
                user.trustScore = Math.max(0, user.trustScore - 33);
                
                if (user.strikes >= 3) {
                    user.isBanned = true;
                    user.isActive = false;
                }
                await user.save();
                report.strikeIssued = true;
            }
        }

        await report.save();

        res.json({
            success: true,
            message: 'Report resolved successfully',
            report
        });
    } catch (error) {
        console.error('Resolve report error:', error);
        res.status(500).json({ message: 'Failed to resolve report', error: error.message });
    }
};

module.exports = {
    submitReport,
    resolveReport
};
