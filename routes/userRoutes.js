const express = require('express');
const router = express.Router();
const { getUser, createUser, updateUser, deleteUser, getUserById } = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Define routes
router.get('/', protect, isAdmin, getUser); // Get all users (CEO only)
router.get('/:id', protect, getUserById); // Get single user by ID (any authenticated user)
router.post('/', protect, isAdmin, createUser); // Create user (CEO only)
router.put('/:id', protect, updateUser); // Update user (any authenticated user)
router.delete('/:id', protect, isAdmin, deleteUser); // Delete user (CEO only)

module.exports = router;
