const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // Find Zainab
    const teacher = await User.findOne({ email: 'zainabminhas11@gmail.com' });
    console.log("Teacher before:", teacher);
    
    if (teacher) {
        teacher.isHOD = !teacher.isHOD;
        await teacher.save();
        console.log("Teacher after toggle:", teacher.isHOD);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
