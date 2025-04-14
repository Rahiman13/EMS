const Task = require('../models/Task');
const User = require('../models/User');

// Create Task
exports.createTask = async (req, res) => {
  const { title, description, dueDate, priority, status, assignedTo, category } = req.body;
  const userId = req.user.id;

  try {
    // Validate assigned user
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ message: 'Invalid assigned user' });
    }

    // Validate due date
    if (new Date(dueDate) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Due date must be today or in the future' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      category,
      createdBy: userId
    });

    await task.save();

    // Populate the assignedTo and createdBy fields
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get All Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get Task by ID
exports.getTaskById = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, dueDate, priority, status, assignedTo, category } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Validate assigned user if being updated
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ message: 'Invalid assigned user' });
      }
    }

    // Validate due date if being updated
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({ message: 'Due date must be in the future' });
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;
    if (category) task.category = category;

    await task.save();

    // Populate the updated task
    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
