const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    department: { 
        type: String, 
        required: true 
    },
    semester: { 
        type: String, 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD
    teacherId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    records: [{
        studentId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', // 👈 Yeh aapke users table/model ka name hai
            required: true 
        },
        status: { 
            type: String, 
            uppercase: true, 
            enum: ['PRESENT', 'ABSENT', 'LEAVE'], 
            default: 'PRESENT' 
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);