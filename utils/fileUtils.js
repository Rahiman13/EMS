const path = require('path');

// Generate File Path for Uploaded Files
exports.generateFilePath = (fileName) => {
  return path.join(__dirname, '../uploads', fileName);
};

// Get File Extension
exports.getFileExtension = (fileName) => {
  return path.extname(fileName);
};
