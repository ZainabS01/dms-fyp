require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Ye line registration ke liye sab se zaroori hai

// Routes
app.use('/api/auth', require('./routes/auth'));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Database Connected Successfully");
        app.listen(5000, () => console.log("🚀 Server running on port 5000"));
    })
    .catch(err => console.log("❌ DB Error:", err));