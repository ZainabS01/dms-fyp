const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Add Task
router.post('/add', async (req, res) => {
    try { 
        const newTask = new Task(req.body); 
        await newTask.save(); 
        res.status(201).json(newTask); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// List Tasks
router.get('/list', async (req, res) => {
    try { 
        const tasks = await Task.find().sort({ issueDate: -1 }); 
        res.status(200).json(tasks); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Update Feedback & Grade
router.put('/feedback/:id', async (req, res) => {
    try {
        const { teacherRemarks, grade } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, 
            { teacherRemarks, grade }, { new: true });
        res.status(200).json(updatedTask);
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

module.exports = router;