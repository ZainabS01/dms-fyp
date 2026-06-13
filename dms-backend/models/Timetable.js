const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    department: String,
    semester: String,
    fileUrl: String, // The file path or link will be saved here
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', TimetableSchema);