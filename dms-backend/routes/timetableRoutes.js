const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs'); // Required for deleting physical files
const path = require('path');
const Timetable = require('../models/Timetable');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// POST: Upload Timetable
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const newEntry = new Timetable({
            title: req.body.title,
            department: req.body.dept || req.body.department, // Accept either from the frontend
            semester: req.body.semester,
            audience: req.body.audience,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            fileUrl: req.file.path,
            uploadedBy: req.body.uploadedBy || 'teacher',
            assignedTeacher: req.body.assignedTeacher || ''
        });
        await newEntry.save();
        res.status(201).json({ message: "Uploaded successfully!", data: newEntry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch All Timetables
const { buildDeptRegex, buildSemRegex } = require('../utils/queryHelpers');

router.get('/list', async (req, res) => {
    try {
        const { department, semester } = req.query;
        let filter = {};
        
        const deptRegex = buildDeptRegex(department);
        if (deptRegex) filter.department = deptRegex;

        const semRegex = buildSemRegex(semester);
        if (semRegex) filter.semester = semRegex;

        const list = await Timetable.find(filter).sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove Timetable & Physical File
router.delete('/delete/:id', async (req, res) => {
    try {
        const item = await Timetable.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "File not found in DB" });

        // Delete physical file
        const filePath = path.join(__dirname, '..', item.fileUrl); // '..' to go back to root from the routes folder
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete database record
        await Timetable.findByIdAndDelete(req.params.id);
        res.json({ message: "File and Record Deleted Successfully" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;