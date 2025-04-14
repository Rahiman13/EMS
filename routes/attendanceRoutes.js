const express = require('express');
const router = express.Router();
const { 
  markLogin, 
  markLogout, 
  getAllAttendance, 
  getAttendanceByDateRange, 
  getUserAttendance, 
  updateAttendance, 
  deleteAttendance,
  getUserAttendanceById,
  getAttendanceByDate,
  updateAttendanceNotes,
  getAttendanceSummary,
  getMonthlyReport
} = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// Mark login/logout
router.post('/login', markLogin);
router.post('/logout', markLogout);

// Get attendance records
router.get('/', getAllAttendance);
router.get('/range', getAttendanceByDateRange);
router.get('/user/:userId', getUserAttendance);

// Get attendance records for a specific date
router.get('/date/:date', getAttendanceByDate);

// Get attendance records for a specific user
router.get('/user/:userId', getUserAttendanceById);

// Update and delete attendance (only for HR/Admin)
router.put('/:attendanceId', updateAttendance);
router.delete('/:attendanceId', deleteAttendance);

// Update attendance notes
router.put('/:attendanceId', updateAttendanceNotes);

// Get attendance summary
router.get('/summary', getAttendanceSummary);

// Get monthly attendance report
router.get('/monthly/:year/:month', getMonthlyReport);

module.exports = router;
