const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Application = require('../models/Application'); // Make sure this model exists

// --- 1. GET REGISTERED STUDENTS ---
router.get('/fetch-students', async (req, res) => {
    try {
        const { department, semester } = req.query;
        let searchCriteria = { role: { $regex: new RegExp('^student$', 'i') } };

        if (department) {
            searchCriteria.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
        }

        if (semester) {
            const cleanSem = semester.trim();
            const semesterNumber = cleanSem.match(/\d+/); 
            if (semesterNumber) {
                const num = semesterNumber[0];
                searchCriteria.$or = [
                    { semester: { $regex: new RegExp(`^${cleanSem}$`, 'i') } },
                    { semester: { $regex: new RegExp(`^${num}$`, 'i') } },
                    { semester: { $regex: new RegExp(`^${num}(st|nd|rd|th)\\s*Semester$`, 'i') } }
                ];
            } else {
                searchCriteria.semester = { $regex: new RegExp(`^${cleanSem}$`, 'i') };
            }
        }

        const students = await User.find(searchCriteria)
            .select('name rollNo _id semester department')
            .sort({ rollNo: 1 })
            .lean();

        return res.json({ success: true, count: students.length, students });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// --- 2. SUBMIT ATTENDANCE ---
router.post('/submit', async (req, res) => {
    try {
        const { department, semester, date, records } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        await Attendance.deleteMany({
            date: targetDate,
            department: { $regex: new RegExp(`^${department.trim()}$`, 'i') },
            semester: { $regex: new RegExp(`^${semester.trim()}$`, 'i') }
        });

        const newAttendance = new Attendance({
            department: department.trim(),
            semester: semester.trim(),
            date: targetDate,
            records: records.map(r => ({
                studentId: r.studentId,
                status: r.status.toUpperCase()
            }))
        });

        await newAttendance.save();

        // Create notification for students
        const Notice = require('../models/Notice');
        await Notice.create({
            title: `Attendance Marked`,
            content: `Attendance for ${department.trim()} - ${semester.trim()} has been updated for ${targetDate}.`,
            target: 'student',
            type: 'Attendance',
            link: 'attendance'
        });

        return res.json({ success: true, message: "Attendance recorded!" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// --- 3. VIEW HISTORY REPORT ---
router.get('/report', async (req, res) => {
    try {
        const { department, semester, startDate, endDate } = req.query;
        let queryCriteria = { date: { $gte: startDate, $lte: endDate } };

        if (department) queryCriteria.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
        if (semester) queryCriteria.semester = { $regex: new RegExp(`^${semester.trim()}$`, 'i') };

        const attendanceData = await Attendance.find(queryCriteria)
            .populate('records.studentId', 'name rollNo')
            .sort({ date: -1 })
            .lean();

        return res.json({ success: true, attendanceData });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching reports" });
    }
});

// --- 4. MY ATTENDANCE ---
router.get('/my-attendance', async (req, res) => {
    try {
        const { studentId } = req.query; 
        
        const attendanceData = await Attendance.find({ 
            "records.studentId": studentId 
        });

        if (attendanceData.length === 0) {
            return res.status(200).json([]); 
        }

        res.status(200).json(attendanceData);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});
router.post('/submit-leave', async (req, res) => {
    console.log("📥 Received request body:", req.body); // Verify this in the terminal
    try {
        const { studentId, subject, reason, startDate, endDate } = req.body;
        
        const newApp = new Application({ 
            studentId, 
            subject, 
            reason, 
            startDate, 
            endDate, 
            status: 'PENDING' 
        });
        
        await newApp.save();
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("❌ Backend Error:", error); // Details of the error will appear here
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/leave-history/:studentId', async (req, res) => {
    try {
        const history = await Application.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ success: false, message: "History fetch error" });
    }
});

module.exports = router;