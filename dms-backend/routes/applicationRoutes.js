const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// 📥 1. STUDENT SIDE: Submit Leave Application
router.post('/submit', verifyToken, async (req, res) => {
    try {
        const { subject, reason, startDate, endDate, targetTeacherId } = req.body;
        const studentId = req.user.id; // Student ID retrieved from token

        if (!subject || !reason || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields (subject, reason, dates)."
            });
        }

        const newApplication = new Application({
            studentId,
            subject: subject.trim(),
            reason: reason.trim(),
            startDate,
            endDate,
            targetTeacherId: targetTeacherId || null
        });

        await newApplication.save();

        return res.status(200).json({
            success: true,
            message: "Your leave application has been successfully submitted!"
        });

    } catch (error) {
        console.error("Application submission error:", error);
        return res.status(500).json({ success: false, message: "Server error while submitting application." });
    }
});

// 📤 2. STUDENT SIDE: View My Personal Application History
router.get('/my-history', verifyToken, async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // Only show student their own submitted applications
        const history = await Application.find({ studentId }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: history.length,
            applications: history
        });
    } catch (error) {
        console.error("Student history fetch error:", error);
        return res.status(500).json({ success: false, message: "Problem loading history." });
    }
});

// 📋 3. TEACHER SIDE: View All Pending/Class Applications (With Student Names)
router.get('/teacher/view-all', verifyToken, async (req, res) => {
    try {
        // Teacher can see leave applications from students of their department
        const currentTeacher = await User.findById(req.user.id).lean();
        const teacherDept = currentTeacher ? currentTeacher.department : 'COMPUTER SCIENCE';

        // First extract IDs of students belonging to the teacher's department
        const classStudents = await User.find({ department: teacherDept }).select('_id');
        const studentIds = classStudents.map(s => s._id);

        // 🎯 POPULATE FIXED: Student name and roll number linked to generate report
        // Also filter by targetTeacherId (allow null for backward compatibility)
        const applications = await Application.find({ 
            studentId: { $in: studentIds },
            $or: [
                { targetTeacherId: req.user.id },
                { targetTeacherId: null }
            ]
        })
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
        return res.status(500).json({ success: false, message: "Server error while fetching applications." });
    }
});

// 📝 4. TEACHER SIDE: Change Status (Approve / Reject)
router.put('/status-update/:id', verifyToken, async (req, res) => {
    try {
        const { status, teacherRemarks } = req.body;
        const applicationId = req.params.id;

        if (!['APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid status! Only APPROVED or REJECTED are allowed." });
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
            return res.status(404).json({ success: false, message: "Application not found." });
        }

        return res.json({
            success: true,
            message: `Application successfully ${status.toLowerCase()}!`,
            updatedApp
        });
    } catch (error) {
        console.error("Status update error:", error);
        return res.status(500).json({ success: false, message: "Server error while updating status." });
    }
});

module.exports = router;