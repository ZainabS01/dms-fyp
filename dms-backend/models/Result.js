const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  university: { type: String, default: 'University of the Punjab' },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  rollNo: { type: String, required: true },
  name: { type: String, required: true },
  gpa: { type: String, default: '' },
  cgpa: { type: String, default: '' },
  dmcFile: { type: String, default: null } 
}, { timestamps: true });

// Ek roll number ka ek semester mein ek hi record rahega
ResultSchema.index({ rollNo: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);