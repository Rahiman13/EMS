const express = require('express');
const router = express.Router();
const { createChatMessage, getChatMessages, deleteChatMessage, getGroupMessages } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes below
router.route('/')
  .post(protect, createChatMessage); // Only logged in users can send messages

router.route('/:chatRoomId')
  .get(protect, getChatMessages); // View messages in a chat room

router.route('/:messageId')
  .delete(protect, deleteChatMessage); // Delete a message

router.route('/group/:groupType')
  .get(protect, getGroupMessages); // Get group messages

module.exports = router;
