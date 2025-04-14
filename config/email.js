const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a reusable transporter object using Gmail as an example
const transporter = nodemailer.createTransport({
  service: 'gmail', // For example, using Gmail SMTP
  auth: {
    user: process.env.EMAIL_USER, // Email user (from .env file)
    pass: process.env.EMAIL_PASS, // Email password (from .env file)
  },
});

module.exports = transporter;
