const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['task', 'announcement', 'reminder'],
        default: 'announcement'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread'
    },
    relatedTo: {
        type: {
            type: String,
            enum: ['task', 'event', 'project']
        },
        id: mongoose.Schema.Types.ObjectId
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Add index for faster queries
notificationSchema.index({ user: 1, status: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
