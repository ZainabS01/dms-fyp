const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// --- 1. NODEMAILER CONFIGURATION ---
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

// --- 2. GET CURRENT USER PROFILE ---
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

// --- 3. LOGIN ROUTE (Initial Authentication) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Email nahi mila!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password galat hai!" });
        }
        
        res.json({ 
            success: true, 
            message: user.role === 'teacher' ? "Please verify PIN" : "Login Successful!",
            requiresPin: user.role === 'teacher', 
            user: { 
                id: user._id,
                name: user.name, 
                role: user.role, 
                email: user.email
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// --- 4. TEACHER PIN LOGIN ---
router.post('/teacher-pin-login', async (req, res) => {
    try {
        const { email, pin } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user || user.pin !== pin) {
            return res.status(400).json({ success: false, message: "Invalid Security PIN!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
        
        res.json({ 
            success: true, 
            token, 
            user: { id: user._id, name: user.name, role: user.role, email: user.email } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "PIN Verification Failed" });
    }
});

// --- 5. REGISTER ROUTE (The Fix) ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department, rollNo, semester, phone } = req.body;

        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ success: false, message: "Email pehle se majood hai!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let generatedPin = null;
        let generatedTeacherId = null;

        if (role && role.toLowerCase() === 'teacher') {
            generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
            generatedTeacherId = Math.random().toString(36).substr(2, 8).toUpperCase();
        }

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'student',
            department,
            phone, 
            semester: role === 'teacher' ? "Faculty" : (semester || "8th"), 
            rollNo: role === 'student' ? rollNo : undefined,
            teacherId: generatedTeacherId,
            pin: generatedPin,
            isSetupComplete: true // 👈 Isey true rakhne se Setup screen nahi ayegi
        });

        await newUser.save();

        if (role === 'teacher' && generatedPin) {
            const mailOptions = {
                from: `"DMS Portal" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Teacher Security PIN',
                html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
                        <h2>Welcome Teacher, ${name}!</h2>
                        <p>Registration successful. Your permanent PIN is: <b style="font-size: 20px;">${generatedPin}</b></p>
                        <p>Login ke baad isi PIN ko use krien.</p>
                       </div>`
            };
            transporter.sendMail(mailOptions).catch(err => console.error("Email Error:", err.message));
        }

        return res.status(201).json({ success: true, message: "Registered Successfully!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Registration failed!" });
    }
});

module.exports = router;