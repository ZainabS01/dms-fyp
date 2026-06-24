require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dms').then(async () => {
    try {
        const departmentStats = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: "$department", students: { $sum: 1 } } },
            { $project: { name: "$_id", students: 1, _id: 0 } }
        ]);
        console.log("Department Stats:", departmentStats);
    } catch (err) {
        console.error("Error:", err);
    }
    process.exit(0);
});
