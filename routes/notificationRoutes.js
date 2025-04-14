const express = require('express');
const router = express.Router();
const {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// Create notification
router.post('/', createNotification);

// Get all notifications with filters
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;
