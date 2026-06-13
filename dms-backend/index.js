require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Socket.io import
const multer = require('multer');

const attendanceRoutes = require('./routes/attendance');
const applicationRoutes = require('./routes/applicationRoutes');
const resultRoutes = require('./routes/resultRoutes');
const taskRoutes = require('./routes/taskRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const studentRoutes = require('./routes/studentRoutes');
const app = express();
const server = http.createServer(app); // Wrapped app in an HTTP server
const queryRoutes = require('./routes/queryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

 

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Frontend URL
        methods: ["GET", "POST"]
    }
});

// Socket Connection Logic
io.on('connection', (socket) => {
    console.log(`🔌 User Connected: ${socket.id}`);
    
    socket.on('send_query', (data) => {
        socket.broadcast.emit('receive_query', data);
    });

    socket.on('disconnect', () => console.log('❌ User Disconnected'));
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true })); 

// --- UPLOADS FOLDER SETUP ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// --- Routes Configuration ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin')); 
app.use('/api/subjects', require('./routes/subjectRoutes')); 
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/query', queryRoutes); // Mounted Query routes under API   
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/notices', noticeRoutes);
app.use('/api/departments', require('./routes/departmentRoutes')); // Mounted Department Routes
// app.use('/api', studentRoutes);

// DB Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Database Connected Successfully");
        // Now use server.listen instead of app.listen
        server.listen(5000, () => console.log("🚀 Server running on port 5000"));
    })
    .catch(err => console.log("❌ DB Error:", err));