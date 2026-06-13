const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// GET all departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.status(200).json(departments);
    } catch (err) {
        console.error("Fetch departments error:", err);
        res.status(500).json({ success: false, message: "Server error while fetching departments" });
    }
});

// POST create a new department
router.post('/', async (req, res) => {
    try {
        const { name, icon, description, highlights } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ success: false, message: "Name and description are required!" });
        }

        const existingDept = await Department.findOne({ name: name.trim().toUpperCase() });
        if (existingDept) {
            return res.status(400).json({ success: false, message: "Department already exists!" });
        }

        const newDept = new Department({
            name: name.trim().toUpperCase(),
            icon: icon || '🏛️',
            description: description.trim(),
            highlights: Array.isArray(highlights) ? highlights : []
        });

        await newDept.save();
        res.status(201).json({ success: true, message: "Department created successfully!", department: newDept });
    } catch (err) {
        console.error("Create department error:", err);
        res.status(500).json({ success: false, message: "Server error while creating department" });
    }
});

// DELETE a department
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await Department.findByIdAndDelete(id);
        
        if (!dept) {
            return res.status(404).json({ success: false, message: "Department not found!" });
        }
        
        res.json({ success: true, message: "Department deleted successfully!" });
    } catch (err) {
        console.error("Delete department error:", err);
        res.status(500).json({ success: false, message: "Server error while deleting department" });
    }
});

// PUT update a department
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, description, highlights } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ success: false, message: "Name and description are required!" });
        }

        const dept = await Department.findByIdAndUpdate(
            id,
            {
                name: name.trim().toUpperCase(),
                icon: icon || '🏛️',
                description: description.trim(),
                highlights: Array.isArray(highlights) ? highlights : []
            },
            { new: true } // Returns the updated document
        );

        if (!dept) {
            return res.status(404).json({ success: false, message: "Department not found!" });
        }

        res.json({ success: true, message: "Department updated successfully!", department: dept });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Department name must be unique!" });
        }
        console.error("Update department error:", err);
        res.status(500).json({ success: false, message: "Server error while updating department" });
    }
});

module.exports = router;
