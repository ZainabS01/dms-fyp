const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// --- NODEMAILER CONFIGURATION ---
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

// --- 2. LOGIN ROUTE (Teacher & Student) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = email.toLowerCase().trim();

        // 1. User ko DB mein check karein
        const user = await User.findOne({ email: lowerEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: "Email registered nahi hai!" });
        }

        // 2. Password verify karein
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password ghalat hai!" });
        }

        // 3. Response data prepare karein
        const responseData = {
            success: true,
            user: { 
                id: user._id,
                name: user.name, 
                role: user.role, 
                email: user.email,
                department: user.department 
            }
        };

        // Agar Teacher hai, to hum unhein aglay step (OTP) par bhejenge
        if (user.role.toLowerCase() === 'teacher') {
            return res.json({ ...responseData, requiresOtp: true, message: "Security Check: Password Correct. Proceed to OTP." });
        }

        // Agar Student hai, to direct login token dein
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });
        res.json({ ...responseData, token, message: "Login Successful!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

// --- 3. REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department, rollNo, semester, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "Zaroori fields fill karein!" });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ success: false, message: "Email pehle se register hai!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let generatedPin = null;
        const userRole = role ? role.toLowerCase() : 'student';

        // Teacher ke liye 4-digit PIN generate karein
        if (userRole === 'teacher') {
            generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
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
            pin: generatedPin,
            isSetupComplete: true 
        });

        await newUser.save();

        // Register ke waqt Teacher ko PIN email karein
        if (userRole === 'teacher' && generatedPin) {
            const mailOptions = {
                from: `"DMS Portal" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Teacher Security PIN',
                html: `<h3>Welcome to DMS</h3><p>Aapka Permanent Security PIN hai: <b>${generatedPin}</b>. Isay login ke waqt use karein.</p>`
            };
            transporter.sendMail(mailOptions).catch(err => console.log("Email error:", err));
        }

        return res.status(201).json({ success: true, message: "Registration Successful!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Registration failed" });
    }
});

// --- 4. SEND OTP ROUTE (For Admin & Teacher) ---
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const mailOptions = {
        from: `"DMS Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Login OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #001f3f;">DMS Verification</h2>
                <p>Login ke liye aapka OTP niche diya gaya hai:</p>
                <h1 style="color: #d4a017; letter-spacing: 5px;">${otp}</h1>
                <p>Ye code sirf 5 minutes ke liye valid hai.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        // Testing phase mein OTP response mein bhej rahe hain
        res.json({ success: true, otp: otp, message: "OTP sent to email!" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ success: false, message: "Email service mein masla hai." });
    }
});

// --- 5. TEACHER PIN VERIFICATION ROUTE ---
router.post('/teacher-pin-login', async (req, res) => {
    try {
        const { email, pin } = req.body;
        const lowerEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: lowerEmail });
        
        if (!user || user.role !== 'teacher') {
            return res.status(404).json({ success: false, message: "Teacher account nahi mila!" });
        }

        // Check if PIN matches
        if (user.pin !== pin) {
            return res.status(400).json({ success: false, message: "Ghalat Security PIN!" });
        }

        // Generate final login token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email,
                department: user.department
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "PIN verification failed" });
    }
});

module.exports = router;