const User = require('../models/User');

// Create User
exports.createUser = async (req, res) => {
  const { name, email, password, role, profilePic, preferences } = req.body;

  try {
    // Check if the email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password, // Consider hashing the password before saving it
      role,
      profilePic,
      preferences,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Users
exports.getUser = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field from response
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id; // Changed from req.user._id to req.user.id

    // If user is requesting their own profile or is an admin, allow access
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the requesting user is either:
    // 1. The same user whose profile is being requested
    // 2. An admin user
    if (requestingUserId !== userId && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

// Update User Profile
exports.updateUser = async (req, res) => {
  const userId = req.params.id; // Get userId from URL params
  const requestingUserId = req.user.id; // Get requesting user's ID
  const { name, email, profilePic, preferences } = req.body;

  try {
    // Find the user to update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the requesting user is either:
    // 1. The same user whose profile is being updated
    // 2. An admin user
    if (requestingUserId !== userId && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Check if the email is changing and if the new email already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update the user profile fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePic) user.profilePic = profilePic;
    if (preferences) user.preferences = preferences;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  const requestingUserId = req.user.id;

  try {
    // Find the user to delete
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the requesting user is CEO
    if (req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized to delete users' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get User Statistics
exports.getUserStatistics = async (req, res) => {
  try {
    // Get total user count
    const totalUsers = await User.countDocuments();

    // Get counts by role
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get counts by category (excluding CEO and Manager)
    const categoryCounts = await User.aggregate([
      {
        $match: {
          role: { $nin: ['CEO', 'Manager'] }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get counts by status
    const statusCounts = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the results
    const formattedRoleCounts = {};
    roleCounts.forEach(item => {
      formattedRoleCounts[item._id || 'Unassigned'] = item.count;
    });

    const formattedCategoryCounts = {};
    categoryCounts.forEach(item => {
      formattedCategoryCounts[item._id || 'Unassigned'] = item.count;
    });

    const formattedStatusCounts = {};
    statusCounts.forEach(item => {
      formattedStatusCounts[item._id || 'Unassigned'] = item.count;
    });

    // Get recent users (last 5)
    const recentUsers = await User.find()
      .select('name email role category createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(); // Convert to plain JavaScript objects

    // Remove category for CEO and Manager in recent users
    recentUsers.forEach(user => {
      if (user.role === 'CEO' || user.role === 'Manager') {
        user.category = null;
      }
    });

    res.json({
      totalUsers,
      byRole: formattedRoleCounts,
      byCategory: formattedCategoryCounts,
      byStatus: formattedStatusCounts,
      recentUsers
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
