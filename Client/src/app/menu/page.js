'use client';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Kita install ini nanti kalo belum

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fungsi buat minta data ke Backend (Port 4000)
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:4000/menu');
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Gagal ambil data:", error);
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🍴 Menu Kantin Hari Ini</h1>
        
        {loading ? (
          <p className="text-center text-gray-500">Sedang memuat menu lezat...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-400">Belum ada menu nih 😢</h2>
            <p className="text-gray-500">Tunggu ibu kantin upload ya!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  {/* Kalau ada gambar pake gambar, kalau gak ada pake emoji */}
                  <span className="text-4xl">
                    {item.gambar ? <img src={item.gambar} className="object-cover h-full w-full"/> : '🍲'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{item.nama}</h3>
                  <p className="text-blue-600 font-bold">Rp {item.harga.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mb-4">Stok: {item.stok}</p>
                  <button 
                    onClick={() => alert(`Kamu pesan ${item.nama}. Fitur order otw!`)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    + Pesan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}