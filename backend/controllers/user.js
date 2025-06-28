
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('../models/userSchema.js');

const JWT_SECRET = process.env.JWT_SECRET

const signupHandler = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Simple check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Save user without hashing password (not secure, only for example)
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Create JWT token (payload can be user id and email)
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '1d' },
        );

        // Set cookie with token (httpOnly is safer)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'lax',
            path: '/',
        });

        res.json({ success: true, message: 'User registered', user: { id: newUser._id, name: newUser.name, email: newUser.email } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

const loginHandler = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        // Check password (plain text, not secure)
        if (user.password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid password' });
        }

        // Create JWT token with 1 day expiry
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'lax',
            path: '/',
        });


        res.json({ success: true, message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};


const getAllUser = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.userId;

        const users = await User.find({ _id: { $ne: currentUserId } }); // exclude current user

        res.status(200).json({
            success: true,
            users,  
        });
    } catch (error) {
        console.error("Error fetching users:", error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch users",
        });
    }
};

module.exports = {
    loginHandler,
    signupHandler,
    getAllUser,
};
