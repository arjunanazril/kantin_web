const express = require('express');
const router = express.Router();
const {
    getMenu,
    tambahProduk,
    editProduk,
    hapusProduk,
    uploadGambar
} = require('../controllers/produkController');

// GET /produk?kantinId=1  → ambil semua menu (bisa filter by kantin)
router.get('/', getMenu);

// POST /produk  → tambah produk (dengan upload gambar)
router.post('/', uploadGambar, tambahProduk);

// PUT /produk/:id  → edit produk
router.put('/:id', uploadGambar, editProduk);

// DELETE /produk/:id  → hapus produk
router.delete('/:id', hapusProduk);

module.exports = router;
