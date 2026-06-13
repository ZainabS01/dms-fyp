const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentName: String,
    fileUrl: String,
    teacherRemarks: String,
    grade: Number
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    department: { type: String, required: true }, // Add this
    semester: { type: String, required: true },   // Add this
    taskType: { type: String, enum: ['Assignment', 'Quiz', 'Other'], default: 'Assignment' },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
submissions: [{
  studentId: String,
  studentName: String,
  fileUrl: String,
  grade: String,
  remarks: String,
  status: { type: String, default: 'Submitted' }
}],
submissionFile: { type: String, default: null }, 
    status: { type: String, default: 'Pending' },
    grade: { type: String, default: null },
    teacherRemarks: { type: String, default: null }
});

module.exports = mongoose.model('Task', taskSchema);