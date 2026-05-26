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

    // 1. Clean department for matching (e.g., "Computer Science" matches "COMPUTER SCIENCE")
    const cleanDept = department.trim();
    let deptQuery = { $regex: new RegExp("^" + cleanDept + "$", "i") };

    // 2. Extract number safely from input (e.g., "1st Semester" -> "1", "8th Semester" -> "8")
    const numMatch = semester.match(/\d+/);
    const targetSemNumber = numMatch ? numMatch[0] : semester.trim();

    // Regex that covers all formats: "1", "1st", "1st Semester" case-insensitively
    let semQuery = { 
      $regex: new RegExp(`^${targetSemNumber}$|^${targetSemNumber}(st|nd|rd|th)|\\b${targetSemNumber}\\b`, "i") 
    };

    // 3. Main query object to search inside Users collection
    // 💥 FIXED: Using Case-Insensitive Regex for 'Student' Role to match "Student" or "student"
    let userCriteria = {
      role: { $regex: /^student$/i }, 
      department: deptQuery,
      semester: semQuery
    };

    console.log("🔍 [Debug Log] Fetching with Criteria:", JSON.stringify(userCriteria));

    // Find all matching students registered in your system
    const students = await User.find(userCriteria).select('rollNo name department semester email');
    
    console.log(`📊 [Debug Log] Found ${students.length} matching students from DB.`);

    // 4. Find any results already posted for this criteria
    const savedResults = await Result.find({
      department: deptQuery,
      semester: semQuery
    });

    // 5. Build dynamic ledger array to prevent blank input values on page refresh
    const integratedLedger = students.map(student => {
      const match = savedResults.find(r => r.rollNo === student.rollNo);
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