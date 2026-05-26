const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        if (!fs.existsSync('uploads/')) { fs.mkdirSync('uploads/'); }
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });

// 1. GET ALL SUBJECTS (Semester wise)
router.get('/:dept/:sem', async (req, res) => {
    try {
        const data = await Subject.find({ department: req.params.dept, semester: req.params.sem });
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. ADD NEW SUBJECT
router.post('/add', async (req, res) => {
    try {
        const { code, title, department, semester, cr } = req.body;
        const newSub = new Subject({
            code, title, department, semester, cr,
            categories: [
                { name: "Books", files: [] },
                { name: "Lecture Notes", files: [] },
                { name: "Images", files: [] }
            ]
        });
        await newSub.save();
        res.status(201).json(newSub);
    } catch (e) { res.status(400).send(e.message); }
});

// 3. EDIT/RENAME MAIN SUBJECT
router.put('/edit/:oldCode', async (req, res) => {
    try {
        const { code, title } = req.body;
        const updated = await Subject.findOneAndUpdate(
            { code: req.params.oldCode },
            { code, title },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Subject nahi mila" });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. DELETE MAIN SUBJECT (Fix: Using ID for 100% success)
router.delete('/delete/:id', async (req, res) => {
    try {
        const deleted = await Subject.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Subject nahi mila" });
        res.json({ message: "Subject Deleted Successfully" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. ADD NEW SUB-FOLDER
router.post('/category/add', async (req, res) => {
    try {
        const { subCode, categoryName } = req.body;
        const subject = await Subject.findOne({ code: subCode });
        if (!subject) return res.status(404).json({ error: "Subject code galat hai" });

        subject.categories.push({ name: categoryName, files: [] });
        await subject.save();
        res.json(subject);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. RENAME SUB-FOLDER
router.put('/category/rename', async (req, res) => {
    try {
        const { subCode, catId, newName } = req.body;
        const subject = await Subject.findOne({ code: subCode });
        const category = subject.categories.id(catId);
        if (!category) return res.status(404).json({ error: "Folder nahi mila" });

        category.name = newName;
        await subject.save();
        res.json({ message: "Folder Renamed Successfully" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE SUB-FOLDER 
router.delete('/category/:subCode/:catId', async (req, res) => {
    try {
        const { subCode, catId } = req.params;
        const subject = await Subject.findOne({ code: subCode });
        
        if (!subject) return res.status(404).json({ message: "Subject Code missing" });

        subject.categories.pull(catId); 
        await subject.save();
        res.json({ message: "Folder Deleted Successfully" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 8. UPLOAD FILE
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { subCode, catId } = req.body;
        const subject = await Subject.findOne({ code: subCode });
        const category = subject.categories.id(catId);
        const newFile = { fileName: req.file.originalname, fileUrl: `/uploads/${req.file.filename}` };
        category.files.push(newFile);
        await subject.save();
        res.json({ message: "Saved", newFile });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 9. DELETE FILE
router.delete('/file/:subCode/:catId/:fileId', async (req, res) => {
    try {
        const { subCode, catId, fileId } = req.params;
        const subject = await Subject.findOne({ code: subCode });
        const category = subject.categories.id(catId);
        category.files.pull(fileId);
        await subject.save();
        res.json({ message: "File Deleted" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;