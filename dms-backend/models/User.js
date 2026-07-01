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
    unique: true,
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
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        default: 'Female'
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: function() { return this.role === 'student'; },
        default: null 
    },
    rollNo: {
        type: String,
        required: function() { return this.role === 'student'; },
        trim: true
    },
    teacherId: {
        type: String,
        default: null
    },
    isHOD: {
        type: Boolean,
        default: false
    },
    pin: {
        type: String,
        default: null 
    },
    approvalToken: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: 'ACTIVE'
    },
    resetOtp: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now
    },
    profilePic: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', UserSchema);