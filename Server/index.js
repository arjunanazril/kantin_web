const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Import pengaman password

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Setup Realtime & CORS
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Frontend boleh masuk
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// ... import lainnya
const multer = require('multer'); // Import Multer
const path = require('path');

// --- SETUP STATIC FOLDER (Biar gambar bisa dilihat) ---
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- SETUP MULTER (Penyimpanan File) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Simpan di folder ini
    },
    filename: (req, file, cb) => {
        // Namain file pakai ID user + waktu biar gak ketuker
        cb(null, 'user-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- ROUTE UPLOAD FOTO PROFIL ---
app.post('/upload-avatar/:id', upload.single('foto'), async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const fileUrl = req.file.filename; // Nama filenya doang

        // Update database user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { foto: fileUrl }
        });

        res.json({ msg: "Foto berhasil ganti!", user: updatedUser });
    } catch (error) {
        res.status(500).json({ msg: "Gagal upload" });
    }
});

// --- RUTE API (JALUR DATA) ---

// 1. REGISTER (Daftar Akun Baru)
app.post('/register', async (req, res) => {
    // Tambah 'role' di sini biar bisa ditangkap dari Postman
    const { nama, nisn, password, role } = req.body; 

    try {
        const cekUser = await prisma.user.findUnique({
            where: { nisn: nisn }
        });

        if (cekUser) {
            return res.status(400).json({ msg: "NISN/ID sudah terdaftar bro!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userBaru = await prisma.user.create({
            data: {
                nama: nama,
                nisn: nisn,
                password: hashedPassword,
                // Logika: Kalau di Postman diisi role, pakai itu. 
                // Kalau kosong, otomatis jadi 'siswa'.
                role: role || "siswa" 
            }
        });

        res.json({ msg: "Berhasil daftar!", user: userBaru });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Gagal daftar, coba lagi." });
    }
});

// 2. LOGIN (Bisa NISN atau NAMA)
app.post('/login', async (req, res) => {
    // Kita namakan 'identifier' karena isinya bisa NISN atau Nama
    const { identifier, password } = req.body; 

    try {
        // Cari user yang NISN-nya cocok ATAU Namanya cocok
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { nisn: identifier },
                    { nama: identifier }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan! Cek nama/NISN." });
        }

        // Cek Password
        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            return res.status(400).json({ msg: "Password salah bro!" });
        }

        // Login Sukses
        res.json({
            msg: "Login berhasil!",
            user: {
                id: user.id,
                nama: user.nama,
                role: user.role
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Server error" });
    }
});

// 4. PESAN MAKANAN (SANGAT KETAT)
app.post('/order', async (req, res) => {
    const { userId, produkId, total } = req.body;
    
    // 🛑 VALIDASI 1: Cek apakah ID User ada?
    if (!userId) {
        return res.status(401).json({ msg: "Akses Ditolak! Kamu belum login." });
    }

    try {
        // 🛑 VALIDASI 2: Cek apakah User ID ini beneran terdaftar di Database?
        const cekUser = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!cekUser) {
            return res.status(404).json({ msg: "User Hantu! Akun tidak ditemukan." });
        }

        // ✅ Kalau lolos semua, baru order diproses
        const order = await prisma.order.create({
            data: { 
                userId: parseInt(userId), 
                produkId: parseInt(produkId), 
                total: parseInt(total), 
                status: 'pending' 
            },
            include: { user: true, produk: true }
        });

        // Notif Realtime
        io.emit("order_baru", { 
            message: `Pesanan baru: ${order.produk.nama}`, 
            data: order 
        });
        
        res.json({ msg: "Pesanan terkirim!", order });
        
    } catch (error) {
        console.log("Error Order:", error);
        res.status(500).json({ msg: "Gagal order karena masalah server." });
    }
});

// 5. TAMBAH MENU (Khusus Admin/Kantin)
app.get('/menu', async (req, res) => {
    try {
        const menus = await prisma.product.findMany();
        res.json(menus);
    } catch (error) {
        res.status(500).json({ error: "Gagal ambil menu" });
    }
});

// 2. TAMBAH MENU (POST) - Buat Admin Nambah Menu
app.post('/menu', async (req, res) => {
    // Ambil data dari Postman
    const { nama, harga, stok, kantinId } = req.body;

    try {
        // Simpan ke Database
        const menuBaru = await prisma.product.create({
            data: {
                nama: nama,
                harga: parseFloat(harga), 
                stok: parseInt(stok),     
                kantinId: parseInt(kantinId),
                gambar: "-" 
            }
        });

        // Balas pesan sukses
        res.json({ msg: "Mantap! Menu berhasil ditambah.", data: menuBaru });

    } catch (error) {
        console.log("Error Upload:", error); // Cek terminal kalau error
        res.status(500).json({ msg: "Gagal nambah menu, cek server." });
    }
});

// Jalankan Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Server Backend ngebut di port ${PORT}`);
});
