const User = require('../models/User');

// @desc    Add a vehicle to driver's profile
// @route   POST /api/logistics/vehicles
// @access  Private (delivery_partner only)
exports.addVehicle = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'delivery_partner') {
            return res.status(403).json({ message: 'Only delivery partners can manage vehicles.' });
        }

        const { vehicleType, registrationNumber, capacityKg, city } = req.body;

        if (!user.deliveryProfile) {
            user.deliveryProfile = { vehicles: [] };
        }

        user.deliveryProfile.vehicles.push({
            vehicleType,
            registrationNumber,
            capacityKg,
            city,
            isActive: true
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            vehicles: user.deliveryProfile.vehicles
        });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get driver's own vehicles
// @route   GET /api/logistics/vehicles
// @access  Private (delivery_partner only)
exports.getMyVehicles = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'delivery_partner') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json({
            success: true,
            vehicles: user.deliveryProfile?.vehicles || []
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/logistics/vehicles/:id
// @access  Private (delivery_partner only)
exports.deleteVehicle = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'delivery_partner') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!user.deliveryProfile || !user.deliveryProfile.vehicles) {
            return res.status(404).json({ message: 'No vehicles found' });
        }

        user.deliveryProfile.vehicles = user.deliveryProfile.vehicles.filter(
            v => v._id.toString() !== req.params.id
        );

        await user.save();

        res.json({
            success: true,
            message: 'Vehicle deleted',
            vehicles: user.deliveryProfile.vehicles
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Logistics Directory (All verified drivers & vehicles)
// @route   GET /api/logistics/directory
// @access  Private (Sellers)
exports.getDirectory = async (req, res) => {
    try {
        const { minCapacity, city } = req.query;

        // Find verified delivery partners
        let query = { role: 'delivery_partner', isVerified: true, isActive: true };

        const drivers = await User.find(query).select('name phone email deliveryProfile');

        let availableVehicles = [];

        drivers.forEach(driver => {
            if (driver.deliveryProfile && driver.deliveryProfile.vehicles) {
                driver.deliveryProfile.vehicles.forEach(vehicle => {
                    if (!vehicle.isActive) return;

                    // Apply filters
                    if (minCapacity && vehicle.capacityKg < Number(minCapacity)) return;
                    if (city && vehicle.city && vehicle.city.toLowerCase() !== city.toLowerCase()) return;

                    availableVehicles.push({
                        driverId: driver._id,
                        driverName: driver.name,
                        driverPhone: driver.phone,
                        vehicleId: vehicle._id,
                        vehicleType: vehicle.vehicleType,
                        capacityKg: vehicle.capacityKg,
                        city: vehicle.city,
                        registrationNumber: vehicle.registrationNumber
                    });
                });
            }
        });

        res.json({
            success: true,
            count: availableVehicles.length,
            vehicles: availableVehicles
        });
    } catch (error) {
        console.error('Error fetching logistics directory:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
