const Chat = require('../models/ChatMessage');
const User = require('../models/User');

// Create Chat Message
exports.createChatMessage = async (req, res) => {
  const { receiverId, message, type, groupType } = req.body;
  const senderId = req.user.id;

  try {
    // Validate if it's a group message or direct message
    if (groupType) {
      // Group message
      if (!['HR', 'Developer', 'DevOps', 'All'].includes(groupType)) {
        return res.status(400).json({ message: 'Invalid group type' });
      }

      const chat = new Chat({
        sender: senderId,
        groupType,
        message,
        type: type || 'text'
      });

      await chat.save();

      // Populate sender information
      const populatedChat = await Chat.findById(chat._id)
        .populate('sender', 'name email');

      res.status(201).json({
        message: 'Group message sent successfully',
        chat: populatedChat
      });
    } else {
      // Direct message
      if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID is required for direct messages' });
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      const chat = new Chat({
        sender: senderId,
        receiver: receiverId,
        message,
        type: type || 'text'
      });

      await chat.save();

      // Populate sender and receiver information
      const populatedChat = await Chat.findById(chat._id)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');

      res.status(201).json({
        message: 'Message sent successfully',
        chat: populatedChat
      });
    }
  } catch (error) {
    console.error('Create chat message error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get All Messages in a Chat Room
exports.getChatMessages = async (req, res) => {
  const { chatRoomId } = req.params;

  try {
    const messages = await Chat.find({ chatRoomId }).populate('sender');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a Chat Message
exports.deleteChatMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Chat.findByIdAndDelete(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete chat message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Group Messages
exports.getGroupMessages = async (req, res) => {
  const { groupType } = req.params;

  try {
    if (!['HR', 'Developer', 'DevOps', 'All'].includes(groupType)) {
      return res.status(400).json({ message: 'Invalid group type' });
    }

    const messages = await Chat.find({ groupType })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
