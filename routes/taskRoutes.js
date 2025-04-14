const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes below
router.route('/')
  .post(protect, createTask)
  .get(protect, getAllTasks);

router.route('/:taskId')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
