const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    // Student details (Dynamic and safe defaults)
    studentName: { type: String, default: "N/A" }, 
    email: { type: String, default: null },
    rollNumber: { type: String, default: "N/A" },
    department: { type: String, default: "N/A" }, 
    semester: { type: String, default: "N/A" },
    
    subject: { type: String, required: true },
    message: { type: String, required: true },
    
    // Who is receiving the query: 'teacher' or 'admin'
    recipient: { type: String, default: "teacher" }, 
    
    // === REPLIES FOR BOTH ROLES (Both fields must exist) ===
    reply: { type: String, default: null },       // Teacher's reply will be saved here
    adminReply: { type: String, default: null },  // Admin's reply will be saved here
    
    status: { type: String, default: "PENDING" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Query', querySchema);