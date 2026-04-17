const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ===========================
// REGISTER SISWA
// ===========================
const registerSiswa = async (req, res) => {
    const { nama, nisn, password } = req.body;

    if (!nama || !nisn || !password) {
        return res.status(400).json({ msg: "Nama, NISN, dan password wajib diisi!" });
    }

    try {
        const cekNisn = await prisma.user.findUnique({ where: { nisn } });
        if (cekNisn) {
            return res.status(400).json({ msg: "NISN sudah terdaftar!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userBaru = await prisma.user.create({
            data: {
                nama,
                nisn,
                password: hashedPassword,
                role: 'siswa'
            }
        });

        res.json({
            msg: "Berhasil daftar sebagai siswa!",
            user: { id: userBaru.id, nama: userBaru.nama, role: userBaru.role }
        });

    } catch (error) {
        console.error("Error registerSiswa:", error);
        res.status(500).json({ msg: "Server error, coba lagi." });
    }
};

// ===========================
// REGISTER PENJUAL
// ===========================
const registerPenjual = async (req, res) => {
    const { nama, username, password, namaKantin } = req.body;

    if (!nama || !username || !password || !namaKantin) {
        return res.status(400).json({ msg: "Nama, username, password, dan nama kantin wajib diisi!" });
    }

    try {
        const cekUsername = await prisma.user.findUnique({ where: { username } });
        if (cekUsername) {
            return res.status(400).json({ msg: "Username sudah dipakai!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Bikin user penjual + kantin sekaligus (transaction)
        const result = await prisma.$transaction(async (tx) => {
            const userBaru = await tx.user.create({
                data: {
                    nama,
                    username,
                    password: hashedPassword,
                    role: 'penjual'
                }
            });

            const kantinBaru = await tx.kantin.create({
                data: {
                    nama: namaKantin,
                    userId: userBaru.id
                }
            });

            return { userBaru, kantinBaru };
        });

        res.json({
            msg: "Berhasil daftar sebagai penjual!",
            user: {
                id: result.userBaru.id,
                nama: result.userBaru.nama,
                role: result.userBaru.role,
                kantin: result.kantinBaru
            }
        });

    } catch (error) {
        console.error("Error registerPenjual:", error);
        res.status(500).json({ msg: "Server error, coba lagi." });
    }
};

// ===========================
// LOGIN (SISWA & PENJUAL)
// ===========================
const login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ msg: "Identifier dan password wajib diisi!" });
    }

    try {
        // Cari by NISN (siswa) atau username (penjual)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { nisn: identifier },
                    { username: identifier }
                ]
            },
            include: {
                kantin: true // Ambil data kantin kalau penjual
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "Akun tidak ditemukan!" });
        }

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(400).json({ msg: "Password salah!" });
        }

        // Response berbeda tergantung role
        const responseData = {
            msg: "Login berhasil!",
            user: {
                id: user.id,
                nama: user.nama,
                role: user.role,
                foto: user.foto,
            }
        };

        // Kalau penjual, tambahin info kantin
        if (user.role === 'penjual' && user.kantin) {
            responseData.user.kantinId = user.kantin.id;
            responseData.user.namaKantin = user.kantin.nama;
        }

        res.json(responseData);

    } catch (error) {
        console.error("Error login:", error);
        res.status(500).json({ msg: "Server error." });
    }
};

module.exports = { registerSiswa, registerPenjual, login };
