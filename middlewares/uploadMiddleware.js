const multer = require('multer');
const path = require('path');

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set the file name to current timestamp + extension
  }
});

// Check file type (ensure only images, PDFs, or Excel files are uploaded)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpg|jpeg|png|pdf|xlsx|xls/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image, PDF, and Excel files are allowed'), false);
  }
};

// Set upload limits (file size in bytes)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
  }
}).single('file'); // Accept a single file

module.exports = upload;
