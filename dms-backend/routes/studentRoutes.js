const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const Result = require('../models/Result');

// 🚀 FIXED ROUTE: Case-Insensitive Role, Department and Loose Semester Engine
router.get('/students-list', async (req, res) => {
  try {
    const { department, semester } = req.query;
    if (!department || !semester) {
      return res.status(400).json({ message: "Parameters missing" });
    }

    // 1. Clean department
    const cleanDept = department.trim();
    let deptQuery = { $regex: new RegExp("^" + cleanDept + "$", "i") };

    // 2. Extract number safely
    const numMatch = semester.match(/\d+/);
    const targetSemNumber = numMatch ? numMatch[0] : semester.trim();

    // Regex for semester
    let semQuery = { 
      $regex: new RegExp(`^${targetSemNumber}$|^${targetSemNumber}(st|nd|rd|th)|\\b${targetSemNumber}\\b`, "i") 
    };

    // --- FIX: Apply filter here ---
    // First, only fetch students who belong to this department and semester
    const students = await User.find({ 
      role: 'student',
      department: deptQuery,
      semester: semQuery 
    }).select('rollNo name department semester email');

    console.log("🔍 Debug: Students found for this filter:", students.length);

    // 4. Find any results already posted for this criteria
    const savedResults = await Result.find({
      department: deptQuery,
      semester: semQuery
    });

    // 5. Build integrated ledger
    const integratedLedger = students.map(student => {
      const match = savedResults.find(r => String(r.rollNo) === String(student.rollNo));
      return {
        _id: student._id,
        rollNo: student.rollNo || 'N/A',
        name: student.name || 'Unknown',
        gpa: match ? match.gpa : '',
        cgpa: match ? match.cgpa : '',
        dmcFile: match ? match.dmcFile : null
      };
    });

    return res.json(integratedLedger);

  } catch (err) {
    console.error("🛑 Live batch sync fault:", err);
    res.status(500).send("Server Error");
  }
});
module.exports = router;