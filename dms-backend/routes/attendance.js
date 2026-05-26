const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// --- 1. GET REGISTERED STUDENTS (SMART EXTRACTOR FOR DEPT & SEMESTER) ---
router.get('/fetch-students', async (req, res) => {
    try {
        const { department, semester } = req.query;
        console.log(`🔍 Fetching Filtered Students -> Dept: ${department}, Semester: ${semester}`);

        // Base search object targeting only active students
        let searchCriteria = {
            role: { $regex: new RegExp('^student$', 'i') }
        };

        if (department) {
            searchCriteria.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
        }

        if (semester) {
            const cleanSem = semester.trim();
            // Extraction logic: "1st Semester" se sirf number "1" nikalega
            const semesterNumber = cleanSem.match(/\d+/); 
            
            if (semesterNumber) {
                const num = semesterNumber[0];
                // $or condition matches either complete string "1st Semester" or just numeric "1"
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

        console.log(`| Total Filtered Students Found: ${students.length}`);

        return res.json({ 
            success: true, 
            count: students.length,
            students 
        });

    } catch (error) {
        console.error("Backend student fetch error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching users." });
    }
});

// --- 2. SUBMIT / RECORD ATTENDANCE MATRIX (PERMANENT DB STORE) ---
router.post('/submit', async (req, res) => {
    try {
        const { department, semester, date, records } = req.body;

        console.log("📥 Storing finalized attendance entry:", { department, semester, date, entriesCount: records?.length });

        if (!department || !semester || !records || records.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing parameters! Department, semester, or records array is missing." 
            });
        }

        const targetDate = date || new Date().toISOString().split('T')[0];
        const cleanDept = department.trim();
        const cleanSem = semester.trim();

        // Safe cleanup to drop duplicates on the same day, department, and semester setup
        await Attendance.deleteMany({
            date: targetDate,
            department: { $regex: new RegExp(`^${cleanDept}$`, 'i') },
            semester: { $regex: new RegExp(`^${cleanSem}$`, 'i') }
        });

        // Insert new structural snapshot log mapping cleanly to DB schema rules
        const newAttendance = new Attendance({
            department: cleanDept,
            semester: cleanSem,
            date: targetDate,
            records: records.map(r => ({
                studentId: r.studentId,
                status: r.status.toUpperCase() // Converts to standard 'PRESENT', 'ABSENT', 'LEAVE'
            }))
        });

        await newAttendance.save();
        console.log("✨ Attendance records successfully committed inside MongoDB Database.");

        return res.json({ 
            success: true, 
            message: "Attendance recorded successfully!" 
        });

    } catch (error) {
        console.error("❌ CRITICAL DB LOG EXCEPTION:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Database insertion failed: " + error.message 
        });
    }
});

// --- 3. VIEW HISTORY REPORT WITH FLEXIBLE PATTERN MATCHING ---
router.get('/report', async (req, res) => {
    try {
        const { department, semester, startDate, endDate } = req.query;
        
        let queryCriteria = {
            date: { $gte: startDate, $lte: endDate }
        };

        if (department) {
            queryCriteria.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
        }
        
        if (semester) {
            const cleanSem = semester.trim();
            const semesterNumber = cleanSem.match(/\d+/);
            
            if (semesterNumber) {
                const num = semesterNumber[0];
                queryCriteria.$or = [
                    { semester: { $regex: new RegExp(`^${cleanSem}$`, 'i') } },
                    { semester: { $regex: new RegExp(`^${num}$`, 'i') } },
                    { semester: { $regex: new RegExp(`^${num}(st|nd|rd|th)\\s*Semester$`, 'i') } }
                ];
            } else {
                queryCriteria.semester = { $regex: new RegExp(`^${cleanSem}$`, 'i') };
            }
        }

        const attendanceData = await Attendance.find(queryCriteria)
            .populate('records.studentId', 'name rollNo')
            .sort({ date: -1 })
            .lean();

        return res.json({
            success: true,
            attendanceData
        });
    } catch (error) {
        console.error("History fetching error:", error);
        return res.status(500).json({ success: false, message: "Error fetching reports log." });
    }
});

module.exports = router;