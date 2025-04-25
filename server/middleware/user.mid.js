import jwt from 'jsonwebtoken';
import config from '../config.js';

function userMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid authorization header:', authHeader);
        return res.status(401).json({ errors: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token ? token.slice(0, 10) + '...' : 'null');

    try {
        const decoded = jwt.verify(token, config.JWT_USER_PASSWORD);
        console.log('Decoded token:', decoded);
        req.user = decoded; // Use req.user instead of req.userId for consistency
        next();
    } catch (error) {
        console.error('Token verification error:', error.message, error.stack);
        return res.status(401).json({ error: 'Invalid authorization or expired token' });
    }
}

export default userMiddleware;