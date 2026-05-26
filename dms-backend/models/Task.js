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
    taskType: { type: String, enum: ['Assignment', 'Quiz', 'Other'], default: 'Assignment' },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    submissions: [submissionSchema]
});

module.exports = mongoose.model('Task', taskSchema);