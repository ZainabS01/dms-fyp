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

    const cleanDept = department.trim();
    let deptRegexString = `^${cleanDept}$`;
    if (cleanDept.toUpperCase().startsWith('BS ')) {
        const withoutBS = cleanDept.substring(3).trim();
        deptRegexString = `^(${cleanDept}|${withoutBS})$`;
    }
    let deptQuery = { $regex: new RegExp(deptRegexString, "i") };

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

// 📚 Fetch All Teachers (Grouped by department in frontend)
router.get('/all-teachers', async (req, res) => {
  try {
    const teachers = await User.find({
      role: { $regex: /^teacher$/i }
    }).select('_id name department').sort({ department: 1, name: 1 });

    res.json({ success: true, teachers });
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ success: false, message: "Server error while fetching teachers." });
  }
});

module.exports = router;