const express = require('express');
const router = express.Router();
const { uploadFile, getFileById, deleteFile, getAllFiles } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes below
router.route('/')
  .post(protect, uploadFile) // Upload files
  .get(protect, getAllFiles);

router.route('/:fileId')
  .get(protect, getFileById) // Get uploaded file
  .delete(protect, deleteFile); // Delete uploaded file

module.exports = router;
