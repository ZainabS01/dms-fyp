const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Yeh kafi hai, niche wala manual index hata diya hai
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'teacher'], 
        default: 'student'
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        default: "N/A" 
    },
    rollNo: {
        type: String,
        required: function() { return this.role === 'student'; } 
    },
    teacherId: {
        type: String,
        default: null
    },
    pin: {
        type: String,
        default: null 
    },
    status: {
        type: String,
        default: 'ACTIVE'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Manual index hata diya hai taake "Duplicate schema index" warning khatam ho jaye

module.exports = mongoose.model('User', UserSchema);