const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    department: String,
    semester: String,
    fileUrl: String, // Yahan file ka path ya link save hoga
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', TimetableSchema);