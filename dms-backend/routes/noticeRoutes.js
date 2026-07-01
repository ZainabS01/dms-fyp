const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');

// Create a new notice (Admin only)
router.post('/', async (req, res) => {
    try {
        const { title, content, target, type, link } = req.body;
        
        if (!title || !content || !target) {
            return res.status(400).json({ error: "Please provide title, content and target audience." });
        }

        const newNotice = new Notice({
            title,
            content,
            target,
            type: type || 'Admin Notice',
            link: link || ''
        });

        await newNotice.save();
        res.status(201).json({ message: "Notice created successfully", notice: newNotice });
    } catch (error) {
        console.error("Error creating notice:", error);
        res.status(500).json({ error: "Failed to create notice" });
    }
});

// Get notices based on target audience
router.get('/', async (req, res) => {
    try {
        const { role, userId } = req.query; // role can be 'student', 'teacher', or 'admin' (for all)
        
        let query = {};
        
        if (userId) {
            const User = require('../models/User');
            const user = await User.findById(userId);
            
            if (user) {
                if (user.role === 'student') {
                    query = {
                        target: { $in: ['student', 'all'] },
                        $and: [
                            {
                                $or: [
                                    { targetDepartment: 'all' },
                                    { targetDepartment: user.department }
                                ]
                            },
                            {
                                $or: [
                                    { targetSemester: 'all' },
                                    { targetSemester: user.semester }
                                ]
                            },
                            {
                                $or: [
                                    { targetUser: 'all' },
                                    { targetUser: user.rollNo },
                                    { targetUser: user._id.toString() }
                                ]
                            }
                        ]
                    };
                } else if (user.role === 'teacher') {
                    query = {
                        target: { $in: ['teacher', 'all'] },
                         $and: [
                            {
                                $or: [
                                    { targetUser: 'all' },
                                    { targetUser: user.teacherId },
                                    { targetUser: user._id.toString() }
                                ]
                            }
                        ]
                    };
                } else if (user.role === 'admin') {
                    query = { target: { $in: ['admin', 'all'] } };
                }
            } else {
                // Fallback if user not found but role is provided
                if (role === 'student') query = { target: { $in: ['student', 'all'] } };
                else if (role === 'teacher') query = { target: { $in: ['teacher', 'all'] } };
                else if (role === 'admin') query = { target: { $in: ['admin', 'all'] } };
            }
        } else {
            // Fallback for requests without userId
            if (role === 'student') {
                query = { target: { $in: ['student', 'all'] } };
            } else if (role === 'teacher') {
                query = { target: { $in: ['teacher', 'all'] } };
            } else if (role === 'admin') {
                query = { target: { $in: ['admin', 'all'] } };
            }
        }

        const notices = await Notice.find(query).sort({ createdAt: -1 });
        res.status(200).json(notices);
    } catch (error) {
        console.error("Error fetching notices:", error);
        res.status(500).json({ error: "Failed to fetch notices" });
    }
});

// Delete a notice or notification
router.delete('/:id', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: "Notice deleted successfully" });
    } catch (error) {
        console.error("Error deleting notice:", error);
        res.status(500).json({ error: "Failed to delete notice" });
    }
});

module.exports = router;
