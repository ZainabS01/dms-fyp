const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const multer = require('multer');
// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/'); // Make sure 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Add Task
router.post('/add', async (req, res) => {
    try { 
        console.log("Data received from frontend:", req.body); // Verify data in the terminal
        const newTask = new Task(req.body); 
        await newTask.save(); 

        const Notice = require('../models/Notice');
        await Notice.create({
            title: `New Task Assigned`,
            content: `A new task "${newTask.title || 'Assignment'}" has been assigned.`,
            target: 'student',
            type: 'Course',
            link: 'task'
        });

        res.status(201).json(newTask); 
    } catch (err) { 
        console.error("DETAILED BACKEND ERROR:", err); // This indicates where the error is
        res.status(500).json({ error: err.message }); 
    }
});
// Student file submission route
router.post('/submit/:id', upload.single('submissionFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File not found!" });
        
        const { studentId, studentName } = req.body;
        if (!studentId) return res.status(400).json({ error: "Student ID missing!" });

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: "Task not found" });

        const existingSubIndex = task.submissions.findIndex(s => s.studentId === studentId);
        
        if (existingSubIndex >= 0) {
            task.submissions[existingSubIndex].fileUrl = req.file.filename;
            task.submissions[existingSubIndex].status = 'Submitted';
            task.submissions[existingSubIndex].studentName = studentName || task.submissions[existingSubIndex].studentName;
        } else {
            task.submissions.push({
                studentId,
                studentName: studentName || 'Unknown Student',
                fileUrl: req.file.filename,
                grade: null,
                remarks: null,
                status: 'Submitted'
            });
        }

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// List Tasks
const { buildDeptRegex, buildSemRegex } = require('../utils/queryHelpers');

router.get('/list', async (req, res) => {
    try { 
        const { department, semester, teacherId } = req.query;
        let filter = {};
        
        const deptRegex = buildDeptRegex(department);
        if (deptRegex) filter.department = deptRegex;

        const semRegex = buildSemRegex(semester);
        if (semRegex) filter.semester = semRegex;

        if (teacherId) {
            filter.teacherId = teacherId;
        }

        const tasks = await Task.find(filter).sort({ issueDate: -1 }); 
        res.json(tasks); // Ensure data is being sent from here
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Update Feedback & Grade for a specific submission
router.put('/feedback/:taskId/:studentId', async (req, res) => {
    try {
        const { grade, teacherRemarks } = req.body;
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ error: "Task not found" });

        const subIndex = task.submissions.findIndex(s => s.studentId === req.params.studentId);
        if (subIndex === -1) return res.status(404).json({ error: "Submission not found for this student" });

        task.submissions[subIndex].grade = grade;
        task.submissions[subIndex].remarks = teacherRemarks;
        task.submissions[subIndex].status = 'Checked';

        await task.save();

        const Notice = require('../models/Notice');
        await Notice.create({
            title: `Task Graded`,
            content: `Your submission for task "${task.title || 'Assignment'}" has been graded: ${grade}`,
            target: 'student',
            type: 'Course',
            link: 'task'
        });

        res.json(task);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Delete Task
router.delete('/delete/:id', async (req, res) => {
    try { 
        await Task.findByIdAndDelete(req.params.id); 
        res.status(200).json({ message: "Deleted" }); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Update Task
router.put('/update/:id', async (req, res) => {
    try {
        const { title, description, subject, taskType, issueDate, dueDate, department, semester } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { title, description, subject, taskType, issueDate, dueDate, department, semester }, 
            { new: true }
        );
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: "Failed to update task" });
    }
});

module.exports = router;