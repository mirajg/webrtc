
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const socketServer = require('./socket/socketServer.js');

require('dotenv').config();
const userRoutes = require('./routes/userRoutes.js');
const homeRoutes = require('./routes/homeRoutes.js');
let connectDB = require('./config/connectDB.js');
const cookieParser = require('cookie-parser');
let authRoutes = require('./routes/authRoutes.js');
const requireLogin = require('./middleware/isAuthenticate.js');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
socketServer(io);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS setup to allow only http://localhost:3000
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // if using cookies or auth
}));

connectDB();

app.use('/', homeRoutes);

app.use('/user', userRoutes);

app.use('/api', requireLogin, authRoutes);


app.get('/logout', (req, res) => {
    res.clearCookie('token', {
        path: '/',         // Make sure it matches the token path
        httpOnly: false,   // Match the same settings as when setting the cookie
        sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
});





app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

server.listen(5000, () => {
    console.log('Server with Socket.io started on port 5000');
});
