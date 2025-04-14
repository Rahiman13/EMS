const express = require('express');
const router = express.Router();
const { createCalendarEvent, getAllCalendarEvents, getCalendarEventById, updateCalendarEvent, deleteCalendarEvent } = require('../controllers/calendarController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Protect all routes below
router.route('/')
  .post(protect, isAdmin, createCalendarEvent) // Only CEO can create
  .get(protect, getAllCalendarEvents); // Everyone can view events

router.route('/:eventId')
  .get(protect, getCalendarEventById)
  .put(protect, isAdmin, updateCalendarEvent) // Only CEO can update
  .delete(protect, isAdmin, deleteCalendarEvent); // Only CEO can delete

module.exports = router;
