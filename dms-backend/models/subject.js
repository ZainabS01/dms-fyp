const mongoose = require('mongoose');

// 1. Files ke liye alag schema (takay har file ki apni ID ho)
const FileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

// 2. Category ke liye schema (Books, Notes wagera)
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [FileSchema] // Upar wala file schema yahan use ho raha hai
});

// 3. Main Subject Schema
const SubjectSchema = new mongoose.Schema({
  department: { 
    type: String, 
    required: true,
    index: true // Search fast karne ke liye
  },
  semester: { 
    type: String, 
    required: true,
    index: true 
  },
  code: { 
    type: String, 
    required: true, 
    unique: true, // Code hamesha unique hona chahiye
    uppercase: true // Taake query mein masla na ho
  },
  title: { 
    type: String, 
    required: true 
  },
  cr: { 
    type: String, 
    default: "0" // Credit Hours ka option
  },
  categories: [CategorySchema] // Sub-folders ka array
}, { timestamps: true }); // Taake pata chale subject kab create hua

module.exports = mongoose.model('Subject', SubjectSchema);