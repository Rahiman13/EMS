const fs = require('fs');
const path = require('path');

// Log File Path
const logFilePath = path.join(__dirname, '../logs/activity.log');

// Log Activity or Error
exports.logActivity = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] - ${message}\n`;
  
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to log activity:', err);
    }
  });
};

// Log Error
exports.logError = (error) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[ERROR - ${timestamp}] - ${error.stack || error}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to log error:', err);
    }
  });
};
