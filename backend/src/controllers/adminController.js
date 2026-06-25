const User = require('../models/User');

// @desc    Get all pending verifications
// @route   GET /api/admin/users/pending
// @access  Private/Admin
const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ isVerified: false, role: { $ne: 'admin' } })
            .select('-password')
            .sort('-createdAt');
            
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify User
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        await user.save();

        res.json({
            success: true,
            message: 'User successfully verified',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getPendingUsers,
    verifyUser
};
