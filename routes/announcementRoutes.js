const express = require('express');
const router = express.Router();
const { createAnnouncement, getAllAnnouncements, getAnnouncementById, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Protect routes
router.route('/')
  .post(protect, isAdmin, createAnnouncement) // Only Admin (CEO) can create
  .get(protect, getAllAnnouncements); // Everyone can view announcements

router.route('/:id')
  .get(protect, getAnnouncementById)
  .put(protect, isAdmin, updateAnnouncement) // Only Admin (CEO) can update
  .delete(protect, isAdmin, deleteAnnouncement); // Only Admin (CEO) can delete

module.exports = router;
