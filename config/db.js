const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      // socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      // family: 4 // Use IPv4, skip trying IPv6
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit the process with failure if connection fails
  }
};

module.exports = connectDB;
