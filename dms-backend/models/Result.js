const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    university: String,
    department: String,
    semester: String,
    rollNo: String,
    name: String,
    gpa: Number,
    cgpa: Number,
    dmcFile: String
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);