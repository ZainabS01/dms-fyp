const mongoose = require('mongoose');

// 1. Separate schema for files (so that each file has its own ID)
const FileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

// 2. Schema for category (Books, Notes, etc.)
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [FileSchema] // The above file schema is used here
});

// 3. Main Subject Schema
const SubjectSchema = new mongoose.Schema({
  department: { 
    type: String, 
    required: true,
    index: true // To make search faster
  },
  semester: { 
    type: String, 
    required: true,
    index: true 
  },
  code: { 
    type: String, 
    required: true, 
    unique: true, // Code must always be unique
    uppercase: true // To prevent case-related issues in queries
  },
  title: { 
    type: String, 
    required: true 
  },
  cr: { 
    type: String, 
    default: "0" // Option for credit hours
  },
  categories: [CategorySchema] // Array of sub-folders
}, { timestamps: true }); // To track when the subject was created

module.exports = mongoose.model('Subject', SubjectSchema);