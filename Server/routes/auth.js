const express = require('express');
const router = express.Router();
const { registerSiswa, registerPenjual, login } = require('../controllers/authController');

// POST /auth/register/siswa
router.post('/register/siswa', registerSiswa);

// POST /auth/register/penjual
router.post('/register/penjual', registerPenjual);

// POST /auth/login
router.post('/login', login);

module.exports = router;
