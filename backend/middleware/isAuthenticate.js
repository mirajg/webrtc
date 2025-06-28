
const jwt = require('jsonwebtoken');

function requireLogin(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Please login or sign up first' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // You can access user info in the next middleware/controller
        next(); // Proceed to the next route handler
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
    }
}

module.exports = requireLogin;
