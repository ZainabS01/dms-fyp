const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');

// Timetable upload route
router.post('/upload', async (req, res) => {
    try {
        const newTimetable = new Timetable(req.body);
        await newTimetable.save();
        res.status(201).json({ message: "Uploaded Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Timetable fetch route
router.get('/list', async (req, res) => {
    const list = await Timetable.find();
    res.json(list);
});

module.exports = router;