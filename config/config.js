require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key', // Secret key for JWT
  jwtExpiration: process.env.JWT_EXPIRATION || '30d', // JWT expiration duration
  port: process.env.PORT || 5000, // Port for the server
};
