const validator = require('validator');

// Validate Email
exports.isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate Password Strength (Minimum 8 characters, 1 uppercase, 1 number)
exports.isValidPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
};
