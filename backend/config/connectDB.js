
const mongoose = require('mongoose');

const uri = process.env.uri
 
let isConnected = false;

const connectDB = async () => { 
    if (isConnected) return;

    try {
        await mongoose.connect(uri);

        isConnected = true;
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw new Error('Failed to connect to MongoDB');
    }
};

module.exports = connectDB;
