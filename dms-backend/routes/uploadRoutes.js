const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: fileFilter
});

// @route   POST /api/upload
// @desc    Upload an image and get its URL
// @access  Public (or protected depending on requirement)
router.post('/', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Multer error: ", err);
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            console.error("Unknown upload error: ", err);
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            
            // Return the path relative to the domain (e.g. /uploads/filename.png)
            const imageUrl = `/uploads/${req.file.filename}`;
            
            res.status(200).json({ 
                success: true, 
                message: 'Image uploaded successfully',
                imageUrl: imageUrl
            });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ success: false, message: 'Server error during upload' });
        }
    });
});

module.exports = router;
