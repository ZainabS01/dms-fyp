require('dotenv').config();
const nodemailer = require('nodemailer');

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

console.log("Verifying transporter with USER:", process.env.EMAIL_USER);

transporter.verify(function (error, success) {
    if (error) {
        console.log("Transporter verify error:", error);
    } else {
        console.log("Server is ready to take our messages");
        
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "Test Email from DMS",
            text: "This is a test email"
        }, (err, info) => {
            if (err) {
                console.log("sendMail error:", err);
            } else {
                console.log("sendMail success:", info.response);
            }
        });
    }
});
