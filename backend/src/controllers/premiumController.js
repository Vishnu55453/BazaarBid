const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper to check if user is premium
const isPremium = (user) => {
    return ['premium_buyer', 'premium_seller'].includes(user.subscription?.planCode);
};

// --- STAFF MANAGEMENT ---

// @desc    Add a staff member
// @route   POST /api/premium/staff
// @access  Private (Parent Account Only)
exports.addStaff = async (req, res) => {
    try {
        const parentUser = await User.findById(req.user.id);
        
        if (!parentUser || parentUser.isStaff) {
            return res.status(403).json({ message: 'Only parent accounts can manage staff.' });
        }

        if (!isPremium(parentUser)) {
            return res.status(403).json({ message: 'Upgrade to Premium to add staff accounts.' });
        }

        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email or phone.' });
        }

        const staffUser = new User({
            name,
            email,
            phone,
            password,
            role: parentUser.role, // inherit role
            isStaff: true,
            parentAccountId: parentUser._id,
            isVerified: true, // Auto-verified since parent is verified
            isActive: true,
            subscription: parentUser.subscription // Share subscription
        });

        await staffUser.save();

        res.status(201).json({
            success: true,
            message: 'Staff account created successfully',
            staff: {
                id: staffUser._id,
                name: staffUser.name,
                email: staffUser.email,
                phone: staffUser.phone
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all staff members
// @route   GET /api/premium/staff
// @access  Private (Parent Account Only)
exports.getStaff = async (req, res) => {
    try {
        if (req.user.isStaff) {
            return res.status(403).json({ message: 'Only parent accounts can view staff.' });
        }

        const staffMembers = await User.find({ parentAccountId: req.user.id, isStaff: true })
            .select('name email phone isActive createdAt');

        res.json({
            success: true,
            staff: staffMembers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove staff member
// @route   DELETE /api/premium/staff/:id
// @access  Private (Parent Account Only)
exports.removeStaff = async (req, res) => {
    try {
        if (req.user.isStaff) {
            return res.status(403).json({ message: 'Only parent accounts can remove staff.' });
        }

        const staffMember = await User.findOne({ _id: req.params.id, parentAccountId: req.user.id });
        if (!staffMember) {
            return res.status(404).json({ message: 'Staff member not found.' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Staff member removed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// --- ADDRESS MANAGEMENT ---

// @desc    Add a delivery address
// @route   POST /api/premium/addresses
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const user = await User.findById(accountId);

        if (!user || user.role !== 'kirana_user') {
            return res.status(403).json({ message: 'Only retail buyers can manage multiple addresses.' });
        }

        const currentAddresses = user.kiranaProfile?.asBuyer?.deliveryAddresses || [];

        if (!isPremium(user) && currentAddresses.length >= 1) {
            return res.status(403).json({ message: 'Upgrade to Premium to add multiple delivery addresses.' });
        }

        const newAddress = {
            shopName: req.body.shopName || user.kiranaProfile?.asSeller?.shopName || user.name,
            area: req.body.area,
            city: req.body.city,
            pincode: req.body.pincode,
            fullAddress: req.body.fullAddress,
            landmark: req.body.landmark,
            isDefault: currentAddresses.length === 0 || req.body.isDefault
        };

        if (newAddress.isDefault) {
            currentAddresses.forEach(addr => addr.isDefault = false);
        }

        currentAddresses.push(newAddress);
        user.kiranaProfile.asBuyer.deliveryAddresses = currentAddresses;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            addresses: user.kiranaProfile.asBuyer.deliveryAddresses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Set default address
// @route   PUT /api/premium/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const user = await User.findById(accountId);

        if (!user || user.role !== 'kirana_user') {
            return res.status(403).json({ message: 'Invalid role.' });
        }

        const addresses = user.kiranaProfile.asBuyer.deliveryAddresses;
        const addressExists = addresses.some(addr => addr._id.toString() === req.params.id);

        if (!addressExists) {
            return res.status(404).json({ message: 'Address not found.' });
        }

        addresses.forEach(addr => {
            addr.isDefault = (addr._id.toString() === req.params.id);
        });

        await user.save();

        res.json({
            success: true,
            message: 'Default address updated.',
            addresses: user.kiranaProfile.asBuyer.deliveryAddresses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete an address
// @route   DELETE /api/premium/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const user = await User.findById(accountId);

        if (!user || user.role !== 'kirana_user') {
            return res.status(403).json({ message: 'Invalid role.' });
        }

        let addresses = user.kiranaProfile.asBuyer.deliveryAddresses;
        if (addresses.length <= 1) {
            return res.status(400).json({ message: 'You must have at least one delivery address.' });
        }

        const addressToDelete = addresses.find(addr => addr._id.toString() === req.params.id);
        if (!addressToDelete) {
            return res.status(404).json({ message: 'Address not found.' });
        }

        user.kiranaProfile.asBuyer.deliveryAddresses = addresses.filter(addr => addr._id.toString() !== req.params.id);

        // If we deleted the default, set the first remaining as default
        if (addressToDelete.isDefault && user.kiranaProfile.asBuyer.deliveryAddresses.length > 0) {
            user.kiranaProfile.asBuyer.deliveryAddresses[0].isDefault = true;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Address deleted successfully.',
            addresses: user.kiranaProfile.asBuyer.deliveryAddresses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
