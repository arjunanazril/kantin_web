const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// === SOCKET.IO ===
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Biar bisa dipakai di controller
app.set('io', io);

io.on('connection', (socket) => {
    console.log('🔌 Client terhubung:', socket.id);
    socket.on('disconnect', () => {
        console.log('❌ Client disconnect:', socket.id);
    });
});

// === ROUTES ===
const authRoutes = require('./routes/auth');
const produkRoutes = require('./routes/produk');
const orderRoutes = require('./routes/order'); 

app.use('/auth', authRoutes);
app.use('/produk', produkRoutes);
app.use('/order', orderRoutes);  

// === JALANKAN SERVER ===
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Server ngebut di http://localhost:${PORT}`);
});
