import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
        ],
        methods: ['GET', 'POST'],
        credentials: true
    },
});

io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    socket.on('join', (userId: string) => {
        socket.join(userId);
        console.log(`[Socket] User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${socket.id}`);
    });
});

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

export default server;
