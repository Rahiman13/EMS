const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);  //auth routes - working
app.use('/api/users', userRoutes); //user routes - working
app.use('/api/calendar', calendarRoutes); //calendar routes - working
app.use('/api/tasks', taskRoutes); //task routes - working
app.use('/api/chats', chatRoutes); //chat routes
app.use('/api/announcements', announcementRoutes); //announcement routes
app.use('/api/uploads', uploadRoutes); //upload routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
