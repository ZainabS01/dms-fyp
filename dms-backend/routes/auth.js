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

// --- 2. LOGIN ROUTE (FIXED WITH LEAN RAW OBJECT) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email aur Password dono likhna zaroori hain!" });
        }

        const lowerEmail = email.toLowerCase().trim();
        
        // Pure javascript raw object load taake document validation crash na ho
        const user = await User.findOne({ email: lowerEmail }).lean();
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Email registered nahi hai!" });
        }

        if (user.status && user.status === 'INACTIVE') {
            return res.status(403).json({ success: false, message: "Aapka account active nahi hai!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password ghalat hai!" });
        }

        const responseData = {
            success: true,
            user: { 
                id: user._id,
                name: user.name, 
                role: user.role, 
                email: user.email,
                department: user.department,
                semester: user.semester,
                rollNo: user.rollNo
            }
        };

        if (user.role && user.role.toLowerCase() === 'teacher') {
            return res.json({ ...responseData, requiresOtp: true, message: "Security Check: Password Correct. Proceed to OTP." });
        }

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

        if (userRole === 'teacher' && generatedPin) {
            const mailOptions = {
                from: `"DMS Portal" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Teacher Security PIN',
                html: `<h3>Welcome to DMS</h3><p>Aapka Permanent Security PIN hai: <b>${generatedPin}</b>. Isay login ke waqt use karein.</p>`
            };
            transporter.sendMail(mailOptions).catch(() => {});
        }

        return res.status(201).json({ success: true, message: "Registration Successful!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Registration failed" });
    }
});

// --- 4. SEND OTP ROUTE ---
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const lowerEmail = email.toLowerCase().trim();
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const user = await User.findOneAndUpdate(
            { email: lowerEmail }, 
            { $set: { resetOtp: otp } }, 
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "Ye Email register nahi hai!" });
        }

        const mailOptions = {
            from: `"DMS Security" <${process.env.EMAIL_USER}>`,
            to: lowerEmail,
            subject: 'Your Verification OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: #001f3f;">DMS Verification</h2>
                    <p>Aapka OTP code niche diya gaya hai:</p>
                    <h1 style="color: #d4a017; letter-spacing: 5px;">${otp}</h1>
                    <p>Ye code sirf 5 minutes ke liye valid hai.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent to email!" }); 
    } catch (error) {
        res.status(500).json({ success: false, message: "Email service error." });
    }
});

// --- 5. FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email missing hai!" });
        }

        const lowerEmail = email.toLowerCase().trim();
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const userUpdate = await User.findOneAndUpdate(
            { email: lowerEmail },
            { $set: { resetOtp: otp } },
            { returnDocument: 'after', runValidators: false }
        );

        if (!userUpdate) {
            return res.status(404).json({ success: false, message: "Ye Email register nahi hai!" });
        }

        const mailOptions = {
            from: `"DMS Recovery" <${process.env.EMAIL_USER}>`,
            to: lowerEmail,
            subject: 'Password Reset OTP',
            html: `<h3>Account Recovery</h3><p>Aapka Reset OTP hai: <b>${otp}</b></p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Reset OTP sent to your Gmail!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Recovery service error" });
    }
});

// --- 6. RESET PASSWORD ---
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword, otp } = req.body; 
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email missing hai!" });
        }

        const lowerEmail = email.toLowerCase().trim();
        const incomingOtp = otp ? String(otp).replace(/\D/g, '').trim() : "";

        const user = await User.findOne({ email: lowerEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: "User nahi mila!" });
        }

        const dbOtp = user.resetOtp ? String(user.resetOtp).replace(/\D/g, '').trim() : "";

        if (!dbOtp || dbOtp !== incomingOtp) {
            return res.status(400).json({ success: false, message: "Ghalat OTP Code!" });
        }

        if (!newPassword) {
            return res.status(400).json({ success: false, message: "Password khali nahi hona chahiye!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(
            user._id,
            { 
                $set: { password: hashedPassword },
                $unset: { resetOtp: "" } 
            },
            { runValidators: false }
        );

        return res.json({ success: true, message: "Password updated successfully!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error: Password update failed" });
    }
});

// --- 7. TEACHER PIN VERIFICATION ---
router.post('/teacher-pin-login', async (req, res) => {
    try {
        const { email, pin } = req.body;
        const lowerEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: lowerEmail });
        
        if (!user || user.role !== 'teacher') {
            return res.status(404).json({ success: false, message: "Teacher account nahi mila!" });
        }

        if (user.pin !== pin) {
            return res.status(400).json({ success: false, message: "Ghalat Security PIN!" });
        }

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
    } catch (error)  {
        res.status(500).json({ success: false, message: "PIN verification failed" });
    }
});

module.exports = router;