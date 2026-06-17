const express = require('express');
const router = express.Router();
// Import User model (Verify the path is models/User.js)
const User = require('../models/User'); 
const nodemailer = require('nodemailer');

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

// 1. Get All Faculty (Sirf wo jin ka role 'teacher' hai)
router.get('/faculty', async (req, res) => {
    try {
        const filter = { role: 'teacher' };
        if (req.query.status) {
            filter.status = new RegExp('^' + req.query.status + '$', 'i');
        }
        const faculty = await User.find(filter);
        res.status(200).json(faculty);
    } catch (err) {
        console.error("Faculty fetch error:", err);
        res.status(500).json({ message: "Server error while fetching faculty" });
    }
});

// 2. Get All Students (Sirf wo jin ka role 'student' hai)
router.get('/students', async (req, res) => {
    try {
        const filter = { role: 'student' };
        if (req.query.status) {
            filter.status = new RegExp('^' + req.query.status + '$', 'i');
        }
        const students = await User.find(filter);
        res.status(200).json(students);
    } catch (err) {
        console.error("Student fetch error:", err);
        res.status(500).json({ message: "Server error while fetching students" });
    }
});

// 3. Verify/Reject Student
router.put('/students/:id/:action', async (req, res) => {
    try {
        const { id, action } = req.params;
        const user = await User.findById(id);
        
        if (!user || user.role !== 'student') {
            return res.status(404).json({ message: "Student not found" });
        }

        if (action === 'approve') {
            user.status = 'ACTIVE';
            await user.save();
            
            // Send email
            const mailOptions = {
                from: `"DMS Admin" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Account Verified - DMS Portal',
                html: `<h3>Congratulations!</h3><p>Your registration request has been accepted by the teacher. You can now login and access your dashboard.</p>`
            };
            transporter.sendMail(mailOptions).catch(() => {});
            
            return res.json({ success: true, message: "Student verified successfully" });
            
        } else if (action === 'reject') {
            user.status = 'REJECTED';
            await user.save();
            
            // Send email
            const mailOptions = {
                from: `"DMS Admin" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Account Rejected - DMS Portal',
                html: `<h3>Account Update</h3><p>Your registration request has been rejected by the teacher.</p>`
            };
            transporter.sendMail(mailOptions).catch(() => {});
            
            return res.json({ success: true, message: "Student rejected successfully" });
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }
    } catch (err) {
        console.error("Student action error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Student
router.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rollNo, name, department, semester } = req.body;
        const user = await User.findByIdAndUpdate(id, { rollNo, name, department, semester }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json({ success: true, message: "Student updated successfully", user });
    } catch (err) {
        console.error("Update student error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete Student
router.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json({ success: true, message: "Student deleted successfully" });
    } catch (err) {
        console.error("Delete student error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// 4. Toggle HOD Status for Teacher (MUST BE BEFORE :action to prevent shadowing)
router.put('/faculty/:id/toggle-hod', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user || user.role !== 'teacher') {
            return res.status(404).json({ message: "Teacher not found" });
        }
        
        user.isHOD = !user.isHOD;
        await user.save();
        
        return res.json({ success: true, message: `Teacher is now ${user.isHOD ? 'an HOD' : 'not an HOD'}`, isHOD: user.isHOD });
    } catch (err) {
        console.error("HOD toggle error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// 3.5 Verify/Reject Teacher
router.put('/faculty/:id/:action', async (req, res) => {
    try {
        const { id, action } = req.params;
        const user = await User.findById(id);
        
        if (!user || user.role !== 'teacher') {
            return res.status(404).json({ message: "Teacher not found" });
        }

        if (action === 'approve') {
            user.status = 'ACTIVE';
            await user.save();
            
            // Send email
            const mailOptions = {
                from: `"DMS Admin" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Account Verified - DMS Portal',
                html: `<h3>Congratulations!</h3><p>Your account has been approved by the admin. You can now access the Teacher Dashboard.</p>`
            };
            transporter.sendMail(mailOptions).catch(() => {});
            
            return res.json({ success: true, message: "Teacher verified successfully" });
            
        } else if (action === 'reject') {
            user.status = 'REJECTED';
            await user.save();
            
            // Send email
            const mailOptions = {
                from: `"DMS Admin" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Account Rejected - DMS Portal',
                html: `<h3>Account Update</h3><p>Your registration request has been rejected by the admin.</p>`
            };
            transporter.sendMail(mailOptions).catch(() => {});
            
            return res.json({ success: true, message: "Teacher rejected successfully" });
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }
    } catch (err) {
        console.error("Teacher action error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Faculty Details
router.put('/faculty/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department } = req.body;
        const user = await User.findByIdAndUpdate(id, { name, department }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.json({ success: true, message: "Teacher updated successfully", user });
    } catch (err) {
        console.error("Update teacher error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// 5. Delete Faculty
router.delete('/faculty/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.json({ success: true, message: "Teacher deleted successfully" });
    } catch (err) {
        console.error("Delete faculty error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Dashboard Stats (Total Students, Total Teachers)
router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        res.status(200).json({ totalStudents, totalTeachers });
    } catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ message: "Server error while fetching stats" });
    }
});

module.exports = router;