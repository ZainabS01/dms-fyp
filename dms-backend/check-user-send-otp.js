require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const User = require('./models/User');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected.");
        
        const email = "zainabshafique.pk@gmail.com";
        const user = await User.findOne({ email: email });
        
        if (!user) {
            console.log("User not found in DB for email:", email);
            process.exit(0);
        }

        console.log("User found:", user.name, "Role:", user.role, "resetOtp:", user.resetOtp);

        let otp = user.resetOtp;
        if (!otp) {
            otp = Math.floor(1000 + Math.random() * 9000).toString();
            await User.findByIdAndUpdate(user._id, { $set: { resetOtp: otp, status: 'ACTIVE' } });
            console.log("Generated new OTP:", otp);
        } else {
            await User.findByIdAndUpdate(user._id, { $set: { status: 'ACTIVE' } });
            console.log("Using existing OTP:", otp);
        }

        const mailOptions = {
            from: `"DMS Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Login OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: #001f3f;">DMS Login Verification</h2>
                    <p>Your OTP code is given below:</p>
                    <h1 style="color: #d4a017; letter-spacing: 5px;">${otp}</h1>
                    <p>This code is only valid for 5 minutes.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("sendMail error to user:", err);
            } else {
                console.log("sendMail success to user:", info.response);
            }
            process.exit(0);
        });

    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

run();
