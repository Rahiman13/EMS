const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const Attendance = require('../models/Attendance');
const { calculateTotalHours, determineStatus } = require('../utils/attendanceUtils');

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password, role, category } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role, category });

        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        if (user.status === 'active') {
            return res.status(400).json({ message: 'User already logged in' });
        }

        user.status = 'active';
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Record login time for attendance
        const currentTime = new Date();
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Check if attendance already exists for today
        let attendance = await Attendance.findOne({
            user: user._id,
            date: currentDate
        });

        if (!attendance) {
            // Create new attendance record
            attendance = new Attendance({
                user: user._id,
                date: currentDate,
                loginTime: currentTime,
                status: determineStatus(currentTime),
                createdBy: user._id
            });
            await attendance.save();
        } else if (!attendance.loginTime) {
            // Update existing attendance record with login time
            attendance.loginTime = currentTime;
            attendance.status = determineStatus(currentTime);
            await attendance.save();
        }

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                category: user.category, 
                profilePic: user.profilePic, 
                preferences: user.preferences, 
                status: user.status, 
                createdAt: user.createdAt 
            },
            attendance: {
                loginTime: attendance.loginTime,
                status: attendance.status
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout User
exports.logoutUser = async (req, res) => {
    try {
        const { id: userId } = req.user;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.status === 'inactive') {
            return res.status(400).json({ message: 'User is already logged out' });
        }

        user.status = 'inactive';
        await user.save();

        // Record logout time and calculate total hours
        const currentTime = new Date();
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Find today's attendance record
        const attendance = await Attendance.findOne({
            user: userId,
            date: currentDate
        });

        if (attendance && !attendance.logoutTime) {
            // Update logout time and calculate total hours
            attendance.logoutTime = currentTime;
            attendance.totalHours = calculateTotalHours(attendance.loginTime, currentTime);
            await attendance.save();
        }

        return res.status(200).json({ 
            message: 'Logout successful', 
            user: user,
            attendance: {
                logoutTime: attendance.logoutTime,
                totalHours: attendance.totalHours
            }
        });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

// Request OTP for password reset
exports.requestOTP = async (req, res) => {
    const { email } = req.body;

    try {
        // Validate email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

        // Delete any existing OTP for this email
        await OTP.deleteMany({ email });

        // Create new OTP
        const otp = new OTP({ email, code: otpCode, expiresAt });
        await otp.save();

        // Send email
        try {
            await sendEmail(
                email,
                'Password Reset OTP',
                `Your OTP for password reset is: ${otpCode}. This OTP will expire in 10 minutes.`
            );
            return res.json({ message: 'OTP sent successfully' });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Delete the OTP if email sending fails
            await OTP.deleteOne({ email });
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Verify OTP for password reset
exports.verifyOTP = async (req, res) => {
    const { email, otpCode } = req.body;

    try {
        const otp = await OTP.findOne({ email, code: otpCode });
        if (!otp) return res.status(400).json({ message: 'Invalid OTP' });

        if (otp.expiresAt < Date.now()) return res.status(400).json({ message: 'OTP has expired' });

        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Password
exports.updatePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};