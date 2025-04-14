const CalendarEvent = require('../models/CalendarEvent');
const User = require('../models/User');

// Create Calendar Event
exports.createCalendarEvent = async (req, res) => {
  const { title, description, startDate, endDate, type, location, attendees } = req.body;
  const userId = req.user.id;

  try {
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Validate attendees
    if (attendees && attendees.length > 0) {
      const validAttendees = await User.find({ _id: { $in: attendees } });
      if (validAttendees.length !== attendees.length) {
        return res.status(400).json({ message: 'One or more attendees are invalid' });
      }
    }

    const event = new CalendarEvent({
      title,
      description,
      startDate,
      endDate,
      type,
      location,
      attendees,
      createdBy: userId
    });

    await event.save();

    // Populate the createdBy and attendees fields
    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    res.status(201).json({
      message: 'Calendar event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get All Calendar Events
exports.getAllCalendarEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.find()
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ startDate: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Get all calendar events error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get Calendar Event by ID
exports.getCalendarEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await CalendarEvent.findById(eventId)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get calendar event by ID error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update Calendar Event
exports.updateCalendarEvent = async (req, res) => {
  const { eventId } = req.params;
  const { title, description, startDate, endDate, type, location, attendees } = req.body;

  try {
    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validate dates if they're being updated
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Validate attendees if they're being updated
    if (attendees && attendees.length > 0) {
      const validAttendees = await User.find({ _id: { $in: attendees } });
      if (validAttendees.length !== attendees.length) {
        return res.status(400).json({ message: 'One or more attendees are invalid' });
      }
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (type) event.type = type;
    if (location) event.location = location;
    if (attendees) event.attendees = attendees;

    await event.save();

    // Populate the updated event
    const updatedEvent = await CalendarEvent.findById(eventId)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    res.json({
      message: 'Calendar event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Delete Calendar Event
exports.deleteCalendarEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await CalendarEvent.findByIdAndDelete(eventId);
    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
