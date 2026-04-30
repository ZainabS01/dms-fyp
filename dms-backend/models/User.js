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
    // Registration form ka "PHONE NO" field
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
    // --- SEMESTER (For Students) / BATCH OR DESIGNATION (For Teachers) ---
    semester: {
        type: String,
        // Agar teacher register ho raha hai to hum default "Faculty" ya N/A rakh sakte hain
        default: "N/A" 
    },
    rollNo: {
        type: String,
        required: function() { return this.role === 'student'; } 
    },
    // --- TEACHER SPECIFIC FIELDS ---
    // Ye ID profile mein "ID: 69EB7994" ki tarah show hogi
    teacherId: {
        type: String,
        unique: true,
        sparse: true // Taake students ke liye ye null reh sakay
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

module.exports = mongoose.model('User', UserSchema);