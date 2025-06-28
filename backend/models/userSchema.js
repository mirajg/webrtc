
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        unique: true, // email should be unique
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

// Avoid model overwrite error in development
const User = mongoose.models?.User || mongoose.model('User', userSchema);

module.exports = User;
