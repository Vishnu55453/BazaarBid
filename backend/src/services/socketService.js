const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

let io;
const userSockets = new Map(); // Map userId -> socketId

exports.initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Handle Authentication
        socket.on('authenticate', (token) => {
            try {
                if (!token) return;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;
                
                // Store connection
                userSockets.set(userId, socket.id);
                console.log(`👤 User ${userId} authenticated on socket ${socket.id}`);
                
                // Send success event back
                socket.emit('authenticated', { success: true });
            } catch (err) {
                console.error('Socket authentication failed:', err.message);
                socket.emit('error', 'Authentication failed');
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
            // Find and remove the disconnected socket from our map
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`👤 User ${userId} removed from socket map`);
                    break;
                }
            }
        });
    });
};

/**
 * Sends a real-time notification to a specific user and saves it to DB.
 * @param {string} userId - The recipient user ID
 * @param {object} notificationData - The notification payload
 */
exports.sendNotification = async (userId, notificationData) => {
    try {
        // 1. Save to Database
        const notification = new Notification({
            userId,
            ...notificationData
        });
        await notification.save();

        // 2. Emit via WebSockets if user is online
        if (io) {
            const socketId = userSockets.get(userId.toString());
            if (socketId) {
                io.to(socketId).emit('notification', notification);
                console.log(`🔔 Emitted notification to user ${userId}`);
            }
        }
    } catch (err) {
        console.error('Error sending notification:', err);
    }
};

exports.getIo = () => io;
