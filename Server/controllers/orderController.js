const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ===========================
// BUAT ORDER (CHECKOUT)
// ===========================
const buatOrder = async (req, res) => {
    const { userId, items } = req.body;
    // items = [{ produkId: 1, quantity: 2 }, { produkId: 3, quantity: 1 }]

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ msg: "userId dan items wajib diisi!" });
    }

    try {
        // Cek user ada
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan!" });

        // Ambil semua produk yang dipesan sekaligus
        const produkIds = items.map(i => parseInt(i.produkId));
        const produkList = await prisma.product.findMany({
            where: { id: { in: produkIds } }
        });

        // Validasi stok & hitung total
        let total = 0;
        const itemsValid = [];

        for (const item of items) {
            const produk = produkList.find(p => p.id === parseInt(item.produkId));

            if (!produk) {
                return res.status(404).json({ msg: `Produk ID ${item.produkId} tidak ditemukan!` });
            }

            if (produk.stok < item.quantity) {
                return res.status(400).json({ msg: `Stok ${produk.nama} tidak cukup! Sisa: ${produk.stok}` });
            }

            total += parseFloat(produk.harga) * parseInt(item.quantity);
            itemsValid.push({ produk, quantity: parseInt(item.quantity) });
        }

        // Buat order + order items + kurangi stok (semuanya dalam 1 transaction)
        const order = await prisma.$transaction(async (tx) => {
            // Buat order utama
            const orderBaru = await tx.order.create({
                data: {
                    userId: parseInt(userId),
                    total,
                    status: 'pending'
                }
            });

            // Buat order items
            await tx.orderItem.createMany({
                data: itemsValid.map(({ produk, quantity }) => ({
                    orderId: orderBaru.id,
                    produkId: produk.id,
                    quantity,
                    harga: produk.harga
                }))
            });

            // Kurangi stok tiap produk
            for (const { produk, quantity } of itemsValid) {
                await tx.product.update({
                    where: { id: produk.id },
                    data: { stok: { decrement: quantity } }
                });
            }

            return orderBaru;
        });

        // Ambil order lengkap dengan items-nya
        const orderLengkap = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                user: { select: { id: true, nama: true } },
                items: {
                    include: {
                        produk: {
                            include: { kantin: true }
                        }
                    }
                }
            }
        });

        // Notif realtime ke PENJUAL
        const io = req.app.get('io');
        io.emit('order_baru', {
            message: `Pesanan baru dari ${orderLengkap.user.nama}!`,
            order: orderLengkap
        });

        res.json({ msg: "Pesanan berhasil dibuat!", order: orderLengkap });

    } catch (error) {
        console.error("Error buatOrder:", error);
        res.status(500).json({ msg: "Gagal buat order." });
    }
};

// ===========================
// GET ORDER BY USER (Riwayat siswa)
// ===========================
const getOrderByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await prisma.order.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { produk: true }
                }
            }
        });

        res.json(orders);
    } catch (error) {
        console.error("Error getOrderByUser:", error);
        res.status(500).json({ msg: "Gagal ambil order." });
    }
};

// ===========================
// GET ORDER BY KANTIN (Dashboard penjual)
// ===========================
const getOrderByKantin = async (req, res) => {
    const { kantinId } = req.params;

    try {
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        produk: { kantinId: parseInt(kantinId) }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, nama: true } },
                items: {
                    where: {
                        produk: { kantinId: parseInt(kantinId) }
                    },
                    include: { produk: true }
                }
            }
        });

        res.json(orders);
    } catch (error) {
        console.error("Error getOrderByKantin:", error);
        res.status(500).json({ msg: "Gagal ambil order kantin." });
    }
};

// ===========================
// UPDATE STATUS ORDER
// ===========================
const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusValid = ['pending', 'dimasak', 'siap', 'selesai'];
    if (!statusValid.includes(status)) {
        return res.status(400).json({ msg: `Status tidak valid! Pilih: ${statusValid.join(', ')}` });
    }

    try {
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                user: { select: { id: true, nama: true } },
                items: { include: { produk: true } }
            }
        });

        // Notif realtime ke SISWA
        const io = req.app.get('io');
        io.emit(`status_order_${order.userId}`, {
            message: `Pesanan kamu sekarang: ${status}!`,
            order
        });

        // Notif juga ke semua (buat dashboard penjual update)
        io.emit('order_diupdate', { order });

        res.json({ msg: `Status berhasil diupdate ke: ${status}`, order });

    } catch (error) {
        console.error("Error updateStatus:", error);
        res.status(500).json({ msg: "Gagal update status." });
    }
};

// ===========================
// LAPORAN PENJUALAN (by kantinId)
// ===========================
const getLaporan = async (req, res) => {
    const { kantinId } = req.params;

    try {
        const orders = await prisma.order.findMany({
            where: {
                status: 'selesai',
                items: {
                    some: { produk: { kantinId: parseInt(kantinId) } }
                }
            },
            include: {
                items: {
                    where: { produk: { kantinId: parseInt(kantinId) } },
                    include: { produk: true }
                }
            }
        });

        // Hitung total pendapatan
        const totalPendapatan = orders.reduce((sum, order) => {
            const subtotal = order.items.reduce((s, item) => {
                return s + (parseFloat(item.harga) * item.quantity);
            }, 0);
            return sum + subtotal;
        }, 0);

        // Produk terlaris
        const produkMap = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const key = item.produkId;
                if (!produkMap[key]) {
                    produkMap[key] = {
                        nama: item.produk.nama,
                        totalTerjual: 0,
                        totalPendapatan: 0
                    };
                }
                produkMap[key].totalTerjual += item.quantity;
                produkMap[key].totalPendapatan += parseFloat(item.harga) * item.quantity;
            });
        });

        const produkTerlaris = Object.values(produkMap)
            .sort((a, b) => b.totalTerjual - a.totalTerjual);

        res.json({
            totalOrder: orders.length,
            totalPendapatan,
            produkTerlaris
        });

    } catch (error) {
        console.error("Error getLaporan:", error);
        res.status(500).json({ msg: "Gagal ambil laporan." });
    }
};

module.exports = { buatOrder, getOrderByUser, getOrderByKantin, updateStatus, getLaporan };
