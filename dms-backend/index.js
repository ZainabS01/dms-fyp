require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Ye line add karein
const fs = require('fs'); // Ye line add karein
const attendanceRoutes = require('./routes/attendance');
const applicationRoutes = require('./routes/applicationRoutes');
const resultRoutes = require('./routes/resultRoutes');
const taskRoutes = require('./routes/taskRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); 


// --- 1. UPLOADS FOLDER SETUP ---
// Ye line files ko browser mein dikhane ke liye zaroori hai
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Agar uploads folder nahi hai toh ye khud bana dega
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// --- Routes Configuration ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin')); 
app.use('/api/subjects', require('./routes/subjectRoutes')); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', resultRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/timetable', timetableRoutes);
// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Database Connected Successfully");
        app.listen(5000, () => console.log("🚀 Server running on port 5000"));
    })
    .catch(err => console.log("❌ DB Error:", err));