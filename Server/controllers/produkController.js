const { PrismaClient } = require('@prisma/client');
const path = require('path');
const multer = require('multer');

const prisma = new PrismaClient();

// === SETUP MULTER (upload gambar produk) ===
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'produk-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const valid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (valid) cb(null, true);
        else cb(new Error("Hanya file gambar yang diizinkan!"));
    }
});

// Export upload buat dipakai di route
const uploadGambar = upload.single('gambar');

// ===========================
// GET SEMUA MENU (by kantinId)
// ===========================
const getMenu = async (req, res) => {
    const { kantinId } = req.query;

    try {
        const where = kantinId ? { kantinId: parseInt(kantinId) } : {};

        const menus = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(menus);
    } catch (error) {
        console.error("Error getMenu:", error);
        res.status(500).json({ msg: "Gagal ambil menu." });
    }
};

// ===========================
// TAMBAH PRODUK
// ===========================
const tambahProduk = async (req, res) => {
    const { nama, harga, stok, kantinId } = req.body;

    if (!nama || !harga || !stok || !kantinId) {
        return res.status(400).json({ msg: "Semua field wajib diisi!" });
    }

    try {
        // Cek kantin ada atau tidak
        const kantin = await prisma.kantin.findUnique({
            where: { id: parseInt(kantinId) }
        });

        if (!kantin) {
            return res.status(404).json({ msg: "Kantin tidak ditemukan!" });
        }

        const gambar = req.file ? req.file.filename : null;

        const produkBaru = await prisma.product.create({
            data: {
                nama,
                harga: parseFloat(harga),
                stok: parseInt(stok),
                kantinId: parseInt(kantinId),
                gambar
            }
        });

        res.json({ msg: "Produk berhasil ditambah!", data: produkBaru });

    } catch (error) {
        console.error("Error tambahProduk:", error);
        res.status(500).json({ msg: "Gagal tambah produk." });
    }
};

// ===========================
// EDIT PRODUK
// ===========================
const editProduk = async (req, res) => {
    const { id } = req.params;
    const { nama, harga, stok } = req.body;

    try {
        const produk = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!produk) {
            return res.status(404).json({ msg: "Produk tidak ditemukan!" });
        }

        const gambar = req.file ? req.file.filename : produk.gambar;

        const updated = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                nama: nama || produk.nama,
                harga: harga ? parseFloat(harga) : produk.harga,
                stok: stok ? parseInt(stok) : produk.stok,
                gambar
            }
        });

        res.json({ msg: "Produk berhasil diupdate!", data: updated });

    } catch (error) {
        console.error("Error editProduk:", error);
        res.status(500).json({ msg: "Gagal edit produk." });
    }
};

// ===========================
// HAPUS PRODUK
// ===========================
const hapusProduk = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        res.json({ msg: "Produk berhasil dihapus!" });

    } catch (error) {
        console.error("Error hapusProduk:", error);
        res.status(500).json({ msg: "Gagal hapus produk." });
    }
};

module.exports = { getMenu, tambahProduk, editProduk, hapusProduk, uploadGambar };
