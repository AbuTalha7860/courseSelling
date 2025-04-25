import jwt from 'jsonwebtoken';
import config from '../config.js';

function adminMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log('Admin Middleware - Authorization Header:', authHeader); // ✅ Added logging

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Admin Middleware - No token or invalid format'); // ✅ Added logging
        return res.status(401).json({ msg: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Admin Middleware - Extracted Token:', token); // ✅ Added logging

    try {
        const decoded = jwt.verify(token, config.JWT_ADMIN_PASSWORD);
        console.log('Admin Middleware - Decoded Token:', decoded); // ✅ Added logging
        req.adminId = decoded.id;
        next();
    } catch (error) {
        console.error('Admin Middleware - Token verification error:', error.message); // ✅ Added logging
        return res.status(401).json({ error: 'Invalid authorization or expired token' });
    }
}

export default adminMiddleware;