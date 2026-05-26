const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 👈 Student ka data link karne ke liye
        required: true
    },
    subject: {
        type: String,
        required: [true, "Application ka subject likhna zaroori hai."]
    },
    reason: {
        type: String,
        required: [true, "Leave ki wajah (reason) likhna zaroori hai."]
    },
    startDate: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    endDate: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    teacherRemarks: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);