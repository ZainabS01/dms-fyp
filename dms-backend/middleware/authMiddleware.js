const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Header se token nikalna (e.g., "Bearer token_yahan_hoga")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ success: false, message: "Pehle Login Krien!" });
    }

    try {
        // Token ko verify karna
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = verified; // User ki ID ko request object mein save karna
        next(); // Agle step (Route) par bhejna
    } catch (err) {
        res.status(403).json({ success: false, message: "Token Expired ya Invalid hai!" });
    }
};

module.exports = verifyToken;