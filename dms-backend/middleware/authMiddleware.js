const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Extract token from header (e.g., "Bearer token_here")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ success: false, message: "Please Login First!" });
    }

    try {
        // Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = verified; // Save user details to request object
        next(); // Send to next step (Route)
    } catch (err) {
        console.error("JWT Verification Failed:", err.message, "Token:", token);
        res.status(403).json({ success: false, message: "Token is Expired or Invalid!" });
    }
};

module.exports = verifyToken;