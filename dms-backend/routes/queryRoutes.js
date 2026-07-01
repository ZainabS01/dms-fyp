const express = require('express');
const router = express.Router();
const Query = require('../models/Query'); 
const Notice = require('../models/Notice');
const nodemailer = require('nodemailer');


// --- STUDENT QUERIES ROUTES ---

// 1. Submit Student Query
// routes/query.js
router.put('/update/:id', async (req, res) => {
    try {
        const { subject, message } = req.body;
        let updateData = {};
        if (subject) updateData.subject = subject;
        if (message) updateData.message = message;
        
        const updatedQuery = await Query.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedQuery);
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// 2. Fetch Queries based on role
router.get('/all', async (req, res) => {
    try {
        const { rollNumber, role } = req.query;
        let filter = {};

        if (role === 'admin') {
            filter = { recipient: 'admin' };
        } else if (role === 'teacher') {
            const { teacherId } = req.query;
            filter = { 
                recipient: 'teacher',
                targetTeacherId: teacherId
            };
        } else {
            // Student
            if (rollNumber) {
                filter = {
                    $or: [
                        { rollNumber: rollNumber },
                        { recipient: rollNumber } // If admin sent direct message to student
                    ]
                };
            }
        }

        const queries = await Query.find(filter)
            .sort({ createdAt: -1 })
            .populate('targetTeacherId', 'name');
        res.json(queries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- ADMIN SUPPORT ROUTES (Teacher to Admin) ---

// 1. Submit Query to Admin
// Ensure this exists in your routes/query.js
// routes/query.js: Create a new route specifically for teacher queries
// routes/query.js
// Backend: Update the query/add route as follows
router.post('/add', async (req, res) => {
    try {
        // 1. Destructure the exact keys coming from the frontend
        const { studentName, email, rollNumber, department, semester, subject, message, recipient, sender, targetTeacherId } = req.body;

        // 2. Check in the console if the data is correctly reaching the backend
        console.log("Backend Received Data:", req.body);

        // 3. Create a new document and assign the values
        const newQuery = new Query({
            studentName: studentName || (sender === 'admin' ? "Admin" : "Unknown Student"),
            email: email || null,
            rollNumber: rollNumber || (sender === 'admin' ? "Admin" : "N/A"), 
            department: department || "N/A",
            semester: semester || "N/A",
            subject,
            message,
            recipient: recipient || "teacher", // Default recipient if not provided
            targetTeacherId: targetTeacherId || null,
            status: sender === 'admin' ? "RESOLVED" : "PENDING"
        });

        // 4. Save into the database
        const savedQuery = await newQuery.save();

        // 5. Create System Notification
        let noticeTarget = 'student';
        if (savedQuery.recipient === 'teacher') noticeTarget = 'teacher';
        else if (savedQuery.recipient === 'admin') noticeTarget = 'admin';

        await Notice.create({
            title: `New Message from ${savedQuery.studentName}`,
            content: `Subject: ${savedQuery.subject}\nMessage: ${savedQuery.message.substring(0, 50)}...`,
            target: noticeTarget,
            targetUser: noticeTarget === 'teacher' ? savedQuery.targetTeacherId : 'all',
            type: 'Query',
            link: 'queries'
        });

        res.status(201).json(savedQuery);

    } catch (err) {
        console.error("Error adding query:", err);
        res.status(500).json({ message: "Server Error while creating query" });
    }
});
// 2. Fetch All Admin Queries
router.get('/admin-query/all', async (req, res) => {
    try {
        const queries = await Query.find({ recipient: 'admin' }).sort({ createdAt: -1 });
        res.json(queries);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- COMMON ROUTES (Reply & Delete) ---

router.put('/reply/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body; // <--- Ensure 'reply' is destructured

        const updatedQuery = await Query.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    reply: reply,
                    status: "RESOLVED"
                } 
            },
            { new: true }
        );

        if (updatedQuery) {
            let noticeTarget = 'student';
            if (updatedQuery.studentName === 'Admin') noticeTarget = 'admin';
            else if (updatedQuery.recipient === 'admin') noticeTarget = updatedQuery.rollNumber === 'N/A' ? 'teacher' : 'student';
            else if (updatedQuery.recipient === 'teacher') noticeTarget = 'student';

            await Notice.create({
                title: `Query Replied: ${updatedQuery.subject}`,
                content: `Your message has received a reply.\nReply: ${reply.substring(0, 50)}...`,
                target: noticeTarget,
                targetUser: updatedQuery.rollNumber !== 'N/A' ? updatedQuery.rollNumber : 'all',
                type: 'Query',
                link: 'queries'
            });

            // Send Email Notification if email exists
            if (updatedQuery.email) {
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: updatedQuery.email,
                        subject: `Reply to your Query: ${updatedQuery.subject}`,
                        text: `Hello ${updatedQuery.studentName},\n\nYour query has been answered.\n\nYour Message: ${updatedQuery.message}\n\nReply: ${reply}\n\nBest Regards,\nDepartment Management System`
                    };

                    await transporter.sendMail(mailOptions);
                    console.log('Reply email sent successfully to', updatedQuery.email);
                } catch (emailErr) {
                    console.error('Failed to send email:', emailErr);
                }
            }
        }

        res.json(updatedQuery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        await Query.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;