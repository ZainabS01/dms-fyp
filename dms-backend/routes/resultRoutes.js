const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Result = require('../models/Result');
const multer = require('multer');

// Updated Multer Storage for file extensions
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ==========================================
// 1. NEW ROUTE: Fetch Individual Student Results (The frontend calls this route)
// ==========================================
router.get('/my-results/:rollNo', async (req, res) => {
    try {
        const { rollNo } = req.params;
        console.log(`Backend hitting: Fetching results for Roll No: ${rollNo}`);

        // Find results for all semesters of this roll number from the database
        // Explicit string handling to prevent data type mismatches (888888 vs "888888")
        const results = await Result.find({ 
            $or: [
                { rollNo: String(rollNo) },
                { rollNo: Number(rollNo) }
            ]
        });

        console.log("Database query outcome results:", results);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error in fetching my-results:", err);
        res.status(500).json({ message: "Server Error while fetching student results" });
    }
});

// ==========================================
// 2. Existing Route: Teacher side students list
// ==========================================
router.get('/students-list', async (req, res) => {
    try {
        const { department, semester } = req.query;
        if (!department || !semester) {
            return res.status(400).json({ message: "Department and semester are required." });
        }

        const cleanDept = department.trim();
        let deptRegexString = `^${cleanDept}$`;
        if (cleanDept.toUpperCase().startsWith('BS ')) {
            const withoutBS = cleanDept.substring(3).trim();
            deptRegexString = `^(${cleanDept}|${withoutBS})$`;
        }

        const cleanSem = semester.trim();
        const semesterNumber = cleanSem.match(/\d+/);
        let semRegexArray = [{ semester: { $regex: new RegExp(`^${cleanSem}$`, 'i') } }];
        if (semesterNumber) {
            const num = semesterNumber[0];
            semRegexArray.push(
                { semester: { $regex: new RegExp(`^${num}$`, 'i') } },
                { semester: { $regex: new RegExp(`^${num}(st|nd|rd|th)\\s*Semester$`, 'i') } },
                { semester: { $regex: new RegExp(`^${num}(st|nd|rd|th)\\s*Sem$`, 'i') } }
            );
        }

        console.log("Debug Query:", JSON.stringify({ 
            role: 'student', 
            department: { $regex: deptRegexString, $options: 'i' }, 
            $or: semRegexArray 
        }, null, 2));

        const students = await User.find({ 
            role: 'student', 
            department: { $regex: new RegExp(deptRegexString, 'i') }, 
            $or: semRegexArray 
        }).lean();
        console.log(`🔍 Debug: Students found for this filter: ${students.length}`);
        if (students.length === 0) return res.json([]);

        const studentsWithResults = await Promise.all(
            students.map(async (student) => {
                const result = await Result.findOne({ 
                    $and: [
                        {
                            $or: [
                                { rollNo: String(student.rollNo) },
                                { rollNo: Number(student.rollNo) }
                            ]
                        },
                        { department: { $regex: new RegExp(deptRegexString, 'i') } },
                        { $or: semRegexArray }
                    ]
                });
                
                return {
                    ...student,
                    gpa: result?.gpa || 'N/A',
                    cgpa: result?.cgpa || 'N/A',
                    dmcFile: result?.dmcFile || null
                };
            })
        );
        res.json(studentsWithResults);
    } catch (err) {
        console.error("Error in students-list:", err);
        res.status(500).json({ message: "Server Error" });
    }
});



// ==========================================
// 4. Existing Route: Upload / Update Marks (Teacher Panel)
// ==========================================
router.post('/upload', upload.single('dmcFile'), async (req, res) => {
    try {
        const { rollNo, department, semester, gpa, cgpa } = req.body;
        
        const updateData = { gpa, cgpa };
        if (req.file) updateData.dmcFile = req.file.path; 

        const updateDoc = {
            $set: updateData,
            $setOnInsert: { rollNo: String(rollNo), department, semester, name: req.body.name }
        };

        // Explicit filter schema matches text configurations
        const result = await Result.findOneAndUpdate(
            { 
                $or: [
                    { rollNo: String(rollNo), department, semester },
                    { rollNo: Number(rollNo), department, semester }
                ]
            },
            updateDoc,
            { upsert: true, new: true } 
        );

        // Create System Notification
        const Notice = require('../models/Notice');
        await Notice.create({
            title: `Result Updated`,
            content: `Result has been updated for Roll No: ${rollNo} in Semester ${semester}.`,
            target: 'student',
            type: 'Result',
            link: 'result'
        });

        res.status(200).json(result); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;