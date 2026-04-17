const express = require('express');
const router = express.Router();
const {
    buatOrder,
    getOrderByUser,
    getOrderByKantin,
    updateStatus,
    getLaporan
} = require('../controllers/orderController');

// POST /order → siswa checkout
router.post('/', buatOrder);

// GET /order/user/:userId → riwayat order siswa
router.get('/user/:userId', getOrderByUser);

// GET /order/kantin/:kantinId → semua order masuk ke kantin
router.get('/kantin/:kantinId', getOrderByKantin);

// PUT /order/:id/status → penjual update status
router.put('/:id/status', updateStatus);

// GET /order/laporan/:kantinId → laporan penjualan
router.get('/laporan/:kantinId', getLaporan);

module.exports = router;
