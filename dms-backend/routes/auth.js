const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

// --- 1. GET CURRENT USER PROFILE ---
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); 
        if (!user) {
            return res.status(404).json({ success: false, message: "User nahi mila!" });
        }
        res.json({ success: true, user }); 
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// --- 2. LOGIN ROUTE (FIXED: Added all fields to response) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Email nahi mila!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password galat hai!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });
        
        // Dashboard ko "N/A" se bachane ke liye saare fields yahan se bhejien
        res.json({ 
            success: true, 
            token, 
            message: user.role === 'teacher' ? "Please verify PIN" : "Login Successful!",
            requiresPin: user.role === 'teacher', 
            user: { 
                id: user._id,
                name: user.name, 
                role: user.role, 
                email: user.email,
                // YEH LINES ADD KI GAYI HAIN:
                rollNo: user.rollNo || "N/A",
                semester: user.semester || "1st Semester",
                department: user.department || "GENERAL"
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// --- 3. REGISTER ROUTE (FIXED: Improved Data Sanitization) ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department, rollNo, semester, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "Please fill all required fields!" });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ success: false, message: "Email already registered!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let generatedPin = null;
        let generatedTeacherId = null;
        const userRole = role ? role.toLowerCase() : 'student';

        if (userRole === 'teacher') {
            generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
            generatedTeacherId = Math.random().toString(36).substr(2, 8).toUpperCase();
        }

        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: userRole,
            department: department ? department.trim().toUpperCase() : "GENERAL",
            phone: phone ? phone.trim() : "", 
            semester: userRole === 'student' ? (semester || "1st Semester") : "Faculty", 
            rollNo: userRole === 'student' ? (rollNo ? rollNo.trim() : "N/A") : undefined,
            teacherId: generatedTeacherId,
            pin: generatedPin,
            isSetupComplete: true 
        });

        await newUser.save();

        if (userRole === 'teacher' && generatedPin) {
            const mailOptions = {
                from: `"DMS Portal" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Teacher Security PIN',
                html: `<p>Welcome, your Security PIN is: <b>${generatedPin}</b></p>`
            };
            transporter.sendMail(mailOptions).catch(err => console.log("Email error ignored"));
        }

        return res.status(201).json({ success: true, message: "Registered Successfully!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;