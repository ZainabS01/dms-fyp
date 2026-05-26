// dms-backend/routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const Result = require('../models/Result'); // Upar banaya hua model import kiya

// 🛠️ Multer Setup (DMC PDF file handle karne ke liye)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Files backend par 'uploads' folder mein jayengi

// 1. ➕ POST API: Result Upload / Save karne ke liye
router.post('/results/upload', upload.single('dmcFile'), async (req, res) => {
  try {
    const { university, department, semester, rollNo, name, gpa, cgpa } = req.body;

    let pdfUrl = '#';
    if (req.file) {
      pdfUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const newResult = new Result({
      university: university || 'University of the Punjab',
      department,
      semester,
      rollNo,
      name,
      gpa: parseFloat(gpa),
      cgpa: parseFloat(cgpa),
      pdfUrl
    });

    await newResult.save();
    return res.status(201).json({ message: "Marks posted successfully!", result: newResult });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 2. 📋 GET API: Saare uploaded results table mein dikhane ke liye
router.get('/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
});

// 3. 🗑️ DELETE API: Kisi student ka result remove karne ke liye
router.delete('/results/:id', async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Result deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;