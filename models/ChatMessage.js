const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groupType: {
    type: String,
    enum: ['HR', 'Developer', 'DevOps', 'All']
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'file'],
    default: 'text'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chat', chatSchema);