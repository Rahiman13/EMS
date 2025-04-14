const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, requestOTP, verifyOTP, updatePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Register a new user
router.route('/register')
  .post(registerUser);

// Login user
router.route('/login')
  .post(loginUser);

// Logout user
router.route('/logout')
  .post(protect, logoutUser); // Protect the logout route

// Password Reset Routes
router.route('/forgot-password')
  .post(requestOTP); // Request OTP for password reset

router.route('/verify-otp')
  .post(verifyOTP); // Verify OTP

router.route('/reset-password')
  .post(updatePassword); // Update password after OTP verification

module.exports = router;
