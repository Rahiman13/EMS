const crypto = require('crypto');

// Generate OTP
exports.generateOTP = () => {
  const otp = crypto.randomBytes(3).toString('hex'); // Generate a 6-character OTP
  return otp.toUpperCase();
};

// Store OTP in the session or database (could be done in the User model or separate collection)
// Verify OTP Function (used for comparing stored OTP and entered OTP)
exports.verifyOTP = (storedOTP, enteredOTP) => {
  return storedOTP === enteredOTP;
};
