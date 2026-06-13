const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    target: { 
        type: String, 
        enum: ['student', 'teacher', 'all', 'admin'], 
        required: true, 
        default: 'all' 
    },
    type: {
        type: String,
        enum: ['Admin Notice', 'Query', 'Attendance', 'Result', 'Course', 'General'],
        default: 'Admin Notice'
    },
    link: {
        type: String,
        default: ''
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Notice', noticeSchema);
