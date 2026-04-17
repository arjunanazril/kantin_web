'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keranjang, setKeranjang] = useState([]); // { produk, quantity }
  const [showKeranjang, setShowKeranjang] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const router = useRouter();

  // Ambil data menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:4000/produk');
        setProducts(response.data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Tambah ke keranjang
  const tambahKeranjang = (produk) => {
    setKeranjang(prev => {
      const ada = prev.find(i => i.produk.id === produk.id);
      if (ada) {
        // Kalau udah ada, tambah quantity
        return prev.map(i =>
          i.produk.id === produk.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { produk, quantity: 1 }];
    });
  };

  // Kurangi dari keranjang
  const kurangiKeranjang = (produkId) => {
    setKeranjang(prev => {
      const item = prev.find(i => i.produk.id === produkId);
      if (item.quantity === 1) {
        return prev.filter(i => i.produk.id !== produkId);
      }
      return prev.map(i =>
        i.produk.id === produkId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  };

  // Hitung total
  const totalHarga = keranjang.reduce((sum, i) => sum + parseFloat(i.produk.harga) * i.quantity, 0);
  const totalItem = keranjang.reduce((sum, i) => sum + i.quantity, 0);

  // Checkout
  const handleCheckout = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Kamu harus login dulu!');
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setLoadingOrder(true);

    try {
      await axios.post('http://localhost:4000/order', {
        userId: user.id,
        items: keranjang.map(i => ({
          produkId: i.produk.id,
          quantity: i.quantity
        }))
      });

      alert('Pesanan berhasil dikirim! Tunggu ya 🎉');
      setKeranjang([]);
      setShowKeranjang(false);

    } catch (error) {
      alert('Gagal order: ' + (error.response?.data?.msg || 'Server Error'));
    } finally {
      setLoadingOrder(false);
    }
  };

  const getQuantityDiKeranjang = (produkId) => {
    const item = keranjang.find(i => i.produk.id === produkId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🍴 Menu Kantin Hari Ini</h1>

          {/* Tombol Keranjang */}
          <button
            onClick={() => setShowKeranjang(true)}
            className="relative bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            🛒 Keranjang
            {totalItem > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItem}
              </span>
            )}
          </button>
        </div>

        {/* List Menu */}
        {loading ? (
          <p className="text-center text-gray-500">Sedang memuat menu lezat...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-400">Belum ada menu nih 😢</h2>
            <p className="text-gray-500">Tunggu ibu kantin upload ya!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((item) => {
              const qty = getQuantityDiKeranjang(item.id);
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.gambar && item.gambar !== '-' ? (
                      <img
                        src={`http://localhost:4000/uploads/${item.gambar}`}
                        className="object-cover h-full w-full"
                        alt={item.nama}
                      />
                    ) : (
                      <span className="text-4xl">🍲</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-gray-800">{item.nama}</h3>
                    <p className="text-blue-600 font-bold">Rp {parseInt(item.harga).toLocaleString('id-ID')}</p>
                    <p className="text-sm text-gray-500 mb-3">Stok: {item.stok}</p>

                    {/* Tombol tambah/kurang */}
                    {qty === 0 ? (
                      <button
                        onClick={() => tambahKeranjang(item)}
                        disabled={item.stok === 0}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {item.stok === 0 ? 'Habis' : '+ Pesan'}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => kurangiKeranjang(item.id)}
                          className="w-9 h-9 bg-gray-200 rounded-lg font-bold text-lg hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span className="font-bold text-lg">{qty}</span>
                        <button
                          onClick={() => tambahKeranjang(item)}
                          disabled={qty >= item.stok}
                          className="w-9 h-9 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Keranjang */}
      {showKeranjang && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">🛒 Keranjang Kamu</h2>
              <button onClick={() => setShowKeranjang(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            {keranjang.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Keranjang kosong nih!</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {keranjang.map(({ produk, quantity }) => (
                    <div key={produk.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium text-gray-800">{produk.nama}</p>
                        <p className="text-sm text-gray-500">Rp {parseInt(produk.harga).toLocaleString('id-ID')} × {quantity}</p>
                      </div>
                      <p className="font-bold text-blue-600">
                        Rp {(parseInt(produk.harga) * quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center font-bold text-lg mb-4">
                  <span>Total</span>
                  <span className="text-blue-600">Rp {totalHarga.toLocaleString('id-ID')}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loadingOrder}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loadingOrder ? 'Memproses...' : '✅ Checkout Sekarang'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
