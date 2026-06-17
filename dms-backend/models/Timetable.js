const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    title: String,
    department: String,
    semester: String,
    audience: String,
    startDate: String,
    endDate: String,
    fileUrl: String, // The file path or link will be saved here
    uploadedBy: String,
    assignedTeacher: String, // Teacher's name or ID for whom this is assigned by admin
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', TimetableSchema);