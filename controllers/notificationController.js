const Notification = require('../models/Notification');

// Create a New Notification
exports.createNotification = async (req, res) => {
    try {
        const { title, message, user, type, priority, relatedTo } = req.body;

        const notification = new Notification({
            title,
            message,
            user,
            type: type || 'announcement',
            priority: priority || 'medium',
            relatedTo
        });

        await notification.save();
        res.status(201).json({
            message: 'Notification created successfully',
            notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Notifications for a User
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from auth middleware
        const { status, type, priority, limit = 10, page = 1 } = req.query;

        const query = { user: userId };
        if (status) query.status = status;
        if (type) query.type = type;
        if (priority) query.priority = priority;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);

        res.json({
            notifications,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Unread Notification Count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.countDocuments({
            user: userId,
            status: 'unread'
        });
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark Notification as Read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            _id: notificationId,
            user: userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.status = 'read';
        await notification.save();

        res.json({
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark All Notifications as Read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            { user: userId, status: 'unread' },
            { status: 'read' }
        );

        res.json({
            message: 'All notifications marked as read',
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            user: userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
