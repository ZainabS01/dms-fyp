const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 👈 For linking student data
        required: true
    },
    targetTeacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 👈 For targeting a specific teacher
        required: false
    },
    subject: {
        type: String,
        required: [true, "Application subject is required."]
    },
    reason: {
        type: String,
        required: [true, "Leave reason is required."]
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