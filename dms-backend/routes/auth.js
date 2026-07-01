require('dotenv').config();
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
router.get('/debug-users', async (req, res) => {
    try {
        const users = await User.find({ role: 'teacher' });
        res.json(users);
    } catch (e) {
        res.json({ error: e.message });
    }
});

router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); 
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }
        res.json({ success: true, user }); 
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// --- 1.5 UPDATE CURRENT USER PROFILE ---
router.put('/profile', verifyToken, async (req, res) => {
    console.log("PROFILE UPDATE CALLED: ", req.user.id, req.body);
    try {
        const { name, profilePic, department, semester, rollNo } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (profilePic !== undefined) updateData.profilePic = profilePic;
        if (department !== undefined) updateData.department = department;
        if (semester !== undefined) updateData.semester = semester;
        if (rollNo !== undefined) updateData.rollNo = rollNo;

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
        if (!user) {
            console.log("User not found!");
            return res.status(404).json({ success: false, message: "User not found!" });
        }
        console.log("Profile updated!");
        res.json({ success: true, message: "Profile updated successfully!", user });
    } catch (error) {
        console.error("Auth Profile Update Error: ", error);
        res.status(500).json({ success: false, message: "Server error updating profile" });
    }
});

// --- 2. LOGIN ROUTE (FIXED WITH LEAN RAW OBJECT) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Both Email and Password are required!" });
        }

        const lowerEmail = email.toLowerCase().trim();
        
        // Load pure javascript raw object so that document validation doesn't crash
        const user = await User.findOne({ email: lowerEmail }).lean();
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Email is not registered!" });
        }

        if (user.status && user.status === 'INACTIVE') {
            return res.status(403).json({ success: false, message: "Your account is not active!" });
        }
        if (user.status && user.status.toUpperCase() === 'PENDING') {
            return res.status(403).json({ success: false, message: "Your account is pending teacher approval. Please wait." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password!" });
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
                rollNo: user.rollNo,
                gender: user.gender
            }
        };

        // ALWAYS SEND OTP for successful password match
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await User.findByIdAndUpdate(user._id, { $set: { resetOtp: otp } });
        
        const activeTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER || 'zainabminhas294@gmail.com',
                pass: process.env.EMAIL_PASS || 'qlye rshi phqp osky'
            }
        });

        const adminEmail = process.env.EMAIL_USER || 'zainabminhas294@gmail.com';
        const mailOptions = {
            from: `"DMS Security" <${adminEmail}>`,
            to: lowerEmail,
            subject: `Login OTP Code - ${Date.now()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: #001f3f;">DMS Login Verification</h2>
                    <p>Your OTP code is given below:</p>
                    <h1 style="color: #d4a017; letter-spacing: 5px;">${otp}</h1>
                    <p>This code is only valid for 5 minutes.</p>
                </div>
            `
        };
        
        try {
            const info = await activeTransporter.sendMail(mailOptions);
            console.log("Realtime OTP Email sent successfully to:", lowerEmail, "MessageID:", info.messageId);
        } catch (mailErr) {
            console.error("Nodemailer real-time sendMail error during login:", mailErr);
        }
        
        return res.json({ ...responseData, requiresOtp: true, message: "Security Check: Password Correct. OTP sent to your email." });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

// --- 3. REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department, rollNo, semester, phone, gender } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "Please fill in the required fields!" });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ success: false, message: "Email is already registered!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const crypto = require('crypto');
        const approvalToken = crypto.randomBytes(20).toString('hex');
        
        const userRole = role ? role.toLowerCase() : 'student';

        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: userRole,
            department: department ? department.trim().toUpperCase() : "GENERAL",
            phone: phone ? phone.trim() : "", 
            semester: userRole === 'student' ? (semester || "1st Semester") : "Faculty", 
            rollNo: userRole === 'student' ? (rollNo ? rollNo.trim() : "N/A") : undefined,
            pin: null, // PIN generated upon approval for teachers
            status: 'PENDING',
            approvalToken: approvalToken,
            isSetupComplete: true,
            gender: gender || 'Female'
        });

        await newUser.save();

        const activeTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER || 'zainabminhas294@gmail.com',
                pass: process.env.EMAIL_PASS || 'qlye rshi phqp osky'
            }
        });

        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        if (userRole === 'teacher') {
            // 1. Notify Teacher
            const teacherMailOptions = {
                from: `"DMS Portal" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
                to: email,
                subject: 'Registration Pending Approval',
                html: `<h3>Registration Successful</h3><p>Your teacher registration is currently <b>pending approval</b> by the Admin. You will receive an email with your Security PIN once approved.</p>`
            };
            activeTransporter.sendMail(teacherMailOptions).catch(err => console.log("Mail Error (Teacher Pending):", err));

            // 2. Notify Admin
            const adminEmail = process.env.EMAIL_USER || 'zainabminhas294@gmail.com'; // Send to system admin email
            const adminMailOptions = {
                from: `"DMS Portal" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
                to: adminEmail,
                subject: 'New Teacher Registration Pending Approval',
                html: `<h3>New Teacher Registration</h3>
                       <p>A new teacher (<b>${newUser.name}</b>, Dept: ${newUser.department}) has registered.</p>
                       <div style="margin-top: 20px;">
                           <a href="${baseUrl}/api/auth/quick-action?userId=${newUser._id}&token=${approvalToken}&action=approve" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve</a>
                           <a href="${baseUrl}/api/auth/quick-action?userId=${newUser._id}&token=${approvalToken}&action=reject" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reject</a>
                       </div>`
            };
            activeTransporter.sendMail(adminMailOptions).catch(err => console.log('Mail Error:', err));

        } else if (userRole === 'student') {
            // 1. Notify Student
            const studentMailOptions = {
                from: `"DMS Portal" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
                to: email,
                subject: 'Registration Pending Approval',
                html: `<h3>Registration Successful</h3><p>Your registration is currently <b>pending approval</b> by your department teacher. You will receive an email once it is approved, and then you will be able to login.</p>`
            };
            activeTransporter.sendMail(studentMailOptions).catch(err => console.log('Mail Error:', err));

            // 2. Notify Department Teachers
            const teachers = await User.find({ role: 'teacher', department: newUser.department, status: 'ACTIVE' });
            if (teachers && teachers.length > 0) {
                const teacherEmails = teachers.map(t => t.email);
                const teacherMailOptions = {
                    from: `"DMS Portal" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
                    to: teacherEmails,
                    subject: 'New Student Registration Pending Approval',
                    html: `<h3>New Student Registration</h3>
                           <p>A new student (<b>${newUser.name}</b>, Roll No: ${newUser.rollNo}) has registered in the <b>${newUser.department}</b> department.</p>
                           <div style="margin-top: 20px;">
                               <a href="${baseUrl}/api/auth/quick-action?userId=${newUser._id}&token=${approvalToken}&action=approve" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve</a>
                               <a href="${baseUrl}/api/auth/quick-action?userId=${newUser._id}&token=${approvalToken}&action=reject" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reject</a>
                           </div>`
                };
                activeTransporter.sendMail(teacherMailOptions).catch(err => console.log('Mail Error:', err));
            }
        }

        const successMessage = userRole === 'student' 
            ? "Registration Successful! Pending Teacher Approval." 
            : "Registration Successful!";
        return res.status(201).json({ success: true, message: successMessage });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Registration failed" });
    }
});

// --- NEW ROUTE: QUICK EMAIL ACTION ---
router.get('/quick-action', async (req, res) => {
    try {
        const { userId, token, action } = req.query;

        if (!userId || !token || !action) {
            return res.status(400).send('<h1 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">Invalid Request! Missing parameters.</h1>');
        }

        const user = await User.findOne({ _id: userId, approvalToken: token });

        if (!user) {
            return res.status(400).send('<h1 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">Invalid or Expired Link!</h1>');
        }

        const activeTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER || 'zainabminhas294@gmail.com',
                pass: process.env.EMAIL_PASS || 'qlye rshi phqp osky'
            }
        });

        if (action === 'approve') {
            user.status = 'ACTIVE';
            user.approvalToken = null; // Clear token

            if (user.role === 'teacher') {
                const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
                user.pin = generatedPin;
                
                const mailOptions = {
                    from: `"DMS Portal" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
                    to: user.email,
                    subject: 'Your Teacher Account is Approved & Security PIN',
                    html: `<h3>Welcome to DMS</h3><p>Your Teacher account has been approved by the Admin.</p><p>Your Permanent Security PIN is: <b>${generatedPin}</b>. Use this during login.</p>`
                };
                await activeTransporter.sendMail(mailOptions).catch(err => console.log('Mail Error:', err));
            } else if (user.role === 'student') {
                const mailOptions = {
                    from: `"DMS Portal" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
                    to: user.email,
                    subject: 'Your Student Registration is Approved',
                    html: `<h3>Congratulations!</h3><p>Your registration has been approved by your department teacher. You can now login to the portal.</p>`
                };
                await activeTransporter.sendMail(mailOptions).catch(err => console.log('Mail Error:', err));
            }

            await user.save();
            return res.send('<h1 style="color:green; text-align:center; font-family:sans-serif; margin-top:50px;">User Approved Successfully! You can close this window.</h1>');

        } else if (action === 'reject') {
            // Delete the pending user
            const userEmail = user.email;
            const userRole = user.role;
            await User.findByIdAndDelete(user._id);

            const mailOptions = {
                from: `"DMS Portal" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
                to: userEmail,
                subject: 'Registration Rejected',
                html: `<h3>Registration Update</h3><p>We are sorry to inform you that your registration for the ${userRole} account has been rejected.</p>`
            };
            await activeTransporter.sendMail(mailOptions).catch(err => console.log('Mail Error:', err));

            return res.send('<h1 style="color:orange; text-align:center; font-family:sans-serif; margin-top:50px;">User Rejected Successfully! You can close this window.</h1>');
        } else {
            return res.status(400).send('<h1 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">Invalid Action!</h1>');
        }
    } catch (error) {
        console.error("Quick Action Error:", error);
        res.status(500).send('<h1 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">Server error during quick action.</h1>');
    }
});

// --- NEW ROUTE: VERIFY LOGIN OTP ---
router.post('/verify-login-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required!" });
        }

        const lowerEmail = email.toLowerCase().trim();
        const incomingOtp = String(otp).replace(/\D/g, '').trim();

        const user = await User.findOne({ email: lowerEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const dbOtp = user.resetOtp ? String(user.resetOtp).replace(/\D/g, '').trim() : "";
        if (!dbOtp || dbOtp !== incomingOtp) {
            return res.status(400).json({ success: false, message: "Invalid OTP Code!" });
        }

        // Clear OTP
        await User.findByIdAndUpdate(user._id, { $unset: { resetOtp: "" } });

        // If teacher, they still need to enter PIN, so we don't generate token yet
        if (user.role && user.role.toLowerCase() === 'teacher') {
            return res.json({ success: true, message: "OTP Verified. Proceed to PIN." });
        }

        // Generate token for students/admin
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });
        
        const responseData = {
            success: true,
            token,
            user: { 
                id: user._id,
                name: user.name, 
                role: user.role, 
                email: user.email,
                department: user.department,
                semester: user.semester,
                rollNo: user.rollNo,
                gender: user.gender
            },
            message: "Login Successful!"
        };

        res.json(responseData);

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error during OTP verification" });
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
            return res.status(404).json({ success: false, message: "This email is not registered!" });
        }

        const activeTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER || 'zainabminhas294@gmail.com',
                pass: process.env.EMAIL_PASS || 'qlye rshi phqp osky'
            }
        });
        const mailOptions = {
            from: `"DMS Security" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
            to: lowerEmail,
            subject: 'Your Verification OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: #001f3f;">DMS Verification</h2>
                    <p>Your OTP code is given below:</p>
                    <h1 style="color: #d4a017; letter-spacing: 5px;">${otp}</h1>
                    <p>This code is only valid for 5 minutes.</p>
                </div>
            `
        };

        try {
            await activeTransporter.sendMail(mailOptions);
            console.log("Realtime OTP sent to email:", lowerEmail);
        } catch (mailErr) {
            console.error("Nodemailer send-otp error:", mailErr);
        }
        res.json({ success: true, message: "OTP sent to email!" }); 
    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({ success: false, message: "Email service error." });
    }
});

// --- 5. FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is missing!" });
        }

        const lowerEmail = email.toLowerCase().trim();
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const userUpdate = await User.findOneAndUpdate(
            { email: lowerEmail },
            { $set: { resetOtp: otp } },
            { returnDocument: 'after', runValidators: false }
        );

        if (!userUpdate) {
            return res.status(404).json({ success: false, message: "This email is not registered!" });
        }

        const activeTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER || 'zainabminhas294@gmail.com',
                pass: process.env.EMAIL_PASS || 'qlye rshi phqp osky'
            }
        });
        const mailOptions = {
            from: `"DMS Recovery" <${process.env.EMAIL_USER || 'zainabminhas294@gmail.com'}>`,
            to: lowerEmail,
            subject: 'Password Reset OTP',
            html: `<h3>Account Recovery</h3><p>Your Reset OTP is: <b>${otp}</b></p>`
        };

        try {
            await activeTransporter.sendMail(mailOptions);
            console.log("Realtime forgot password OTP sent to:", lowerEmail);
        } catch (mailErr) {
            console.error("Nodemailer forgot-password error:", mailErr);
        }
        res.json({ success: true, message: "Reset OTP sent to your Gmail!" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Recovery service error" });
    }
});

// --- 6. RESET PASSWORD ---
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword, otp } = req.body; 
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is missing!" });
        }

        const lowerEmail = email.toLowerCase().trim();
        const incomingOtp = otp ? String(otp).replace(/\D/g, '').trim() : "";

        const user = await User.findOne({ email: lowerEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const dbOtp = user.resetOtp ? String(user.resetOtp).replace(/\D/g, '').trim() : "";

        if (!dbOtp || dbOtp !== incomingOtp) {
            return res.status(400).json({ success: false, message: "Incorrect OTP Code!" });
        }

        if (!newPassword) {
            return res.status(400).json({ success: false, message: "Password must not be empty!" });
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
            return res.status(404).json({ success: false, message: "Teacher account not found!" });
        }

        if (user.pin !== pin) {
            return res.status(400).json({ success: false, message: "Incorrect Security PIN!" });
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
                department: user.department,
                gender: user.gender
            }
        });
    } catch (error)  {
        res.status(500).json({ success: false, message: "PIN verification failed" });
    }
});

module.exports = router;