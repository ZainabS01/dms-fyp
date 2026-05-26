const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// 📥 1. STUDENT SIDE: Submit Leave Application
router.post('/submit', verifyToken, async (req, res) => {
    try {
        const { subject, reason, startDate, endDate } = req.body;
        const studentId = req.user.id; // Token se student ki ID mil gayi

        if (!subject || !reason || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Meharbani karke saari fields (subject, reason, dates) fill karein."
            });
        }

        const newApplication = new Application({
            studentId,
            subject: subject.trim(),
            reason: reason.trim(),
            startDate,
            endDate
        });

        await newApplication.save();

        return res.status(200).json({
            success: true,
            message: "Aapki leave application kamyabi se submit ho gayi hai!"
        });

    } catch (error) {
        console.error("Application submission error:", error);
        return res.status(500).json({ success: false, message: "Application submit karne mein server error." });
    }
});

// 📤 2. STUDENT SIDE: View My Personal Application History
router.get('/my-history', verifyToken, async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // Student ko sirf apni dali hui applications dikhein
        const history = await Application.find({ studentId }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: history.length,
            applications: history
        });
    } catch (error) {
        console.error("Student history fetch error:", error);
        return res.status(500).json({ success: false, message: "History load karne mein masla hai." });
    }
});

// 📋 3. TEACHER SIDE: View All Pending/Class Applications (With Student Names)
router.get('/teacher/view-all', verifyToken, async (req, res) => {
    try {
        // Teacher apne department ke bacho ki application dekh sake
        const currentTeacher = await User.findById(req.user.id).lean();
        const teacherDept = currentTeacher ? currentTeacher.department : 'COMPUTER SCIENCE';

        // Phele un bacho ki IDs nikalenge jo teacher ke department mein hain
        const classStudents = await User.find({ department: teacherDept }).select('_id');
        const studentIds = classStudents.map(s => s._id);

        // 🎯 POPULATE FIXED: Bacho ka naam aur roll number link ho kar report generate hogi
        const applications = await Application.find({ studentId: { $in: studentIds } })
            .populate({
                path: 'studentId',
                model: 'User',
                select: 'name rollNo department semester'
            })
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error("Teacher applications load error:", error);
        return res.status(500).json({ success: false, message: "Applications fetch karne mein server error." });
    }
});

// 📝 4. TEACHER SIDE: Change Status (Approve / Reject)
router.put('/status-update/:id', verifyToken, async (req, res) => {
    try {
        const { status, teacherRemarks } = req.body;
        const applicationId = req.params.id;

        if (!['APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid status! Sirf APPROVED ya REJECTED chalega." });
        }

        const updatedApp = await Application.findByIdAndUpdate(
            applicationId,
            { 
                $set: { 
                    status: status.toUpperCase(), 
                    teacherRemarks: teacherRemarks ? teacherRemarks.trim() : '' 
                } 
            },
            { new: true }
        );

        if (!updatedApp) {
            return res.status(404).json({ success: false, message: "Application nahi mili." });
        }

        return res.json({
            success: true,
            message: `Application successfully ${status.toLowerCase()} ho gayi hai!`,
            updatedApp
        });
    } catch (error) {
        console.error("Status update error:", error);
        return res.status(500).json({ success: false, message: "Status update karne mein server error." });
    }
});

module.exports = router;