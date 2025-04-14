const Announcement = require('../models/Announcement');
const User = require('../models/User');

// Create Announcement
exports.createAnnouncement = async (req, res) => {
  const { title, content, category, priority, targetDepartment } = req.body;
  const userId = req.user.id;

  try {
    const announcement = new Announcement({
      title,
      content,
      category,
      priority,
      targetDepartment,
      createdBy: userId
    });

    await announcement.save();

    // Populate the createdBy field
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: populatedAnnouncement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get All Announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ announcements });
  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get Announcement by ID
exports.getAnnouncementById = async (req, res) => {
    const announcementId = req.params.id;

  try {
    const announcement = await Announcement.findById(announcementId)
      .populate('createdBy', 'name email');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement by ID error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update Announcement
exports.updateAnnouncement = async (req, res) => {
  const announcementId = req.params.id;
  const { title, content, category, priority, targetDepartment } = req.body;

  try {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Update fields
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (targetDepartment) announcement.targetDepartment = targetDepartment;
    announcement.updatedAt = new Date();

    await announcement.save();

    // Populate the updated announcement
    const updatedAnnouncement = await Announcement.findById(announcementId)
      .populate('createdBy', 'name email');

    res.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Delete Announcement
exports.deleteAnnouncement = async (req, res) => {
  const announcementId = req.params.id;

  try {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(announcementId);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
