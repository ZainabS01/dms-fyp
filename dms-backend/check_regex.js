const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const department = "COMPUTER SCIENCE";
    const cleanDept = department.trim();
    // The exact query from studentRoutes.js
    const deptQuery = { $regex: cleanDept, $options: "i" };

    console.log("Looking for role matching: ", /^teacher$/i);
    console.log("Looking for department matching: ", deptQuery);

    const teachers = await User.find({
      role: { $regex: /^teacher$/i }, // Just in case role has casing differences
      department: deptQuery
    }).select('_id name department role');
    
    console.log("Results length:", teachers.length);
    console.log("Results:", teachers);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
