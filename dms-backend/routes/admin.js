const express = require('express');
const router = express.Router();
// User model ko import karein (Rasta check kar lein ke models/User.js hi hai)
const User = require('../models/User'); 

// 1. Get All Faculty (Sirf wo jin ka role 'teacher' hai)
router.get('/faculty', async (req, res) => {
    try {
        const faculty = await User.find({ role: 'teacher' });
        res.status(200).json(faculty);
    } catch (err) {
        console.error("Faculty fetch error:", err);
        res.status(500).json({ message: "Server error while fetching faculty" });
    }
});

// 2. Get All Students (Sirf wo jin ka role 'student' hai)
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        res.status(200).json(students);
    } catch (err) {
        console.error("Student fetch error:", err);
        res.status(500).json({ message: "Server error while fetching students" });
    }
});

module.exports = router;