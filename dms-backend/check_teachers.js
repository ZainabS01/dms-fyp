const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const teachers = await User.find({ role: 'teacher' });
    console.log("Teachers found:", teachers.map(t => ({ name: t.name, department: t.department, role: t.role })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
