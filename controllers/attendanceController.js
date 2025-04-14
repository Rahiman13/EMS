const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Log Attendance (Entry/Exit)
exports.logAttendance = async (req, res) => {
  try {
    const { type } = req.body; // 'entry' or 'exit'

    const attendance = new Attendance({
      user: req.user.id,
      type,
      date: new Date()
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Monthly Attendance Summary
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth();
    const userAttendance = await Attendance.find({
      user: req.user.id,
      date: {
        $gte: new Date(new Date().getFullYear(), currentMonth, 1),
        $lt: new Date(new Date().getFullYear(), currentMonth + 1, 1)
      }
    });

    res.status(200).json(userAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Weekly Attendance Summary
exports.getWeeklyAttendance = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const userAttendance = await Attendance.find({
      user: req.user.id,
      date: { $gte: startOfWeek }
    });

    res.status(200).json(userAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark Login Time
exports.markLogin = async (req, res) => {
  const userId = req.user.id;
  const currentTime = new Date();
  const currentDate = new Date().setHours(0, 0, 0, 0);

  try {
    // Check if attendance already exists for today
    let attendance = await Attendance.findOne({
      user: userId,
      date: currentDate
    });

    if (attendance) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    // Create new attendance record
    attendance = new Attendance({
      user: userId,
      date: currentDate,
      loginTime: currentTime,
      status: this.determineStatus(currentTime),
      createdBy: userId
    });

    await attendance.save();

    // Populate user information
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('user', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Login time marked successfully',
      attendance: populatedAttendance
    });
  } catch (error) {
    console.error('Mark login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Mark Logout Time
exports.markLogout = async (req, res) => {
  const userId = req.user.id;
  const currentTime = new Date();
  const currentDate = new Date().setHours(0, 0, 0, 0);

  try {
    // Find today's attendance record
    const attendance = await Attendance.findOne({
      user: userId,
      date: currentDate
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for today' });
    }

    if (attendance.logoutTime) {
      return res.status(400).json({ message: 'Logout time already marked for today' });
    }

    // Update logout time and calculate total hours
    attendance.logoutTime = currentTime;
    attendance.totalHours = this.calculateTotalHours(attendance.loginTime, currentTime);
    
    await attendance.save();

    // Populate user information
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('user', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      message: 'Logout time marked successfully',
      attendance: populatedAttendance
    });
  } catch (error) {
    console.error('Mark logout error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get All Attendance Records
exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: -1, loginTime: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get Attendance by Date Range
exports.getAttendanceByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const attendance = await Attendance.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: -1, loginTime: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance by date range error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get User's Attendance Records
exports.getUserAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, status, limit = 10, page = 1 } = req.query;

        const query = { user: userId };
        
        // Add date range filter
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        // Add status filter
        if (status) {
            query.status = status;
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Attendance.countDocuments(query);

        res.json({
            attendance,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Attendance Records for a Specific Date
exports.getAttendanceByDate = async (req, res) => {
    try {
        const date = new Date(req.params.date);
        date.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({ date })
            .populate('user', 'name email');

        res.json({ attendance });
    } catch (error) {
        console.error('Get attendance by date error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Attendance Records for a Specific User
exports.getUserAttendanceById = async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        const query = { user: userId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1 });

        res.json({ attendance });
    } catch (error) {
        console.error('Get user attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Attendance Notes
exports.updateAttendanceNotes = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { notes } = req.body;

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        attendance.notes = notes;
        await attendance.save();

        res.json({
            message: 'Attendance updated successfully',
            attendance
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Attendance Summary
exports.getAttendanceSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        const query = { user: userId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query);

        const summary = {
            totalDays: attendance.length,
            presentDays: attendance.filter(a => a.status === 'present').length,
            lateDays: attendance.filter(a => a.status === 'late').length,
            absentDays: attendance.filter(a => a.status === 'absent').length,
            halfDays: attendance.filter(a => a.status === 'half-day').length,
            leaveDays: attendance.filter(a => a.status === 'leave').length,
            averageHours: attendance.reduce((acc, curr) => acc + (curr.totalHours || 0), 0) / attendance.length || 0
        };

        res.json({ summary });
    } catch (error) {
        console.error('Get attendance summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Monthly Attendance Report
exports.getMonthlyReport = async (req, res) => {
    try {
        const { year, month } = req.params;
        const userId = req.user.id;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendance = await Attendance.find({
            user: userId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        const report = {
            month: new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
            totalWorkingDays: attendance.length,
            attendance: attendance.map(a => ({
                date: a.date.toISOString().split('T')[0],
                status: a.status,
                loginTime: a.loginTime ? a.loginTime.toLocaleTimeString('en-US', { hour12: false }) : null,
                logoutTime: a.logoutTime ? a.logoutTime.toLocaleTimeString('en-US', { hour12: false }) : null,
                totalHours: a.totalHours
            }))
        };

        res.json({ report });
    } catch (error) {
        console.error('Get monthly report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Attendance
exports.updateAttendance = async (req, res) => {
  const { attendanceId } = req.params;
  const { status, notes } = req.body;

  try {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update fields
    if (status) attendance.status = status;
    if (notes) attendance.notes = notes;

    await attendance.save();

    // Populate user information
    const updatedAttendance = await Attendance.findById(attendanceId)
      .populate('user', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      message: 'Attendance updated successfully',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Delete Attendance
exports.deleteAttendance = async (req, res) => {
  const { attendanceId } = req.params;

  try {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await Attendance.findByIdAndDelete(attendanceId);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Helper function to determine status based on login time
exports.determineStatus = (loginTime) => {
  const standardLoginTime = new Date();
  standardLoginTime.setHours(9, 0, 0, 0); // 9:00 AM

  if (loginTime > standardLoginTime) {
    return 'late';
  }
  return 'present';
};

// Helper function to calculate total hours
exports.calculateTotalHours = (loginTime, logoutTime) => {
  const diffMs = logoutTime - loginTime;
  return Math.round((diffMs % 86400000) / 3600000); // Convert to hours
};
