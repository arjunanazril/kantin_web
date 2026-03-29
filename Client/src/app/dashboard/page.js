"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar"; // Pastikan kamu sudah buat file Navbar.js di folder components
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null); 
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FUNGSI MUAT DATA USER ---
  // Kita pisah fungsinya biar bisa dipanggil ulang sama Navbar pas ganti foto
  const loadUser = () => {
    const data = localStorage.getItem("user");
    if (data) {
      setUser(JSON.parse(data));
    } else {
      setUser(null); // Kalau gak ada data, berarti tamu
    }
  };

  // --- 2. SAAT HALAMAN DIBUKA ---
  useEffect(() => {
    loadUser();     // Cek siapa yang datang
    fetchMenu();    // Ambil daftar makanan
  }, []);

  // --- 3. AMBIL MENU DARI BACKEND ---
  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://localhost:4000/menu");
      setMenus(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal ambil menu", error);
      setLoading(false);
    }
  };

  // --- 4. KLIK TOMBOL BELI ---
  const handleBeli = async (produkId, harga) => {
    // 🛑 CEK SUPER KETAT: Harus ada user DAN user harus punya ID
    if (!user || !user.id) {
      alert("Sistem mendeteksi kamu belum login dengan benar! 🛑");
      
      // Bersihkan memori hantu yang nyangkut
      localStorage.removeItem("user"); 
      setUser(null); 
      
      // Tendang ke halaman login
      router.push("/login");
      return; 
    }

    if (!confirm("Yakin mau pesan menu ini?")) return;

    try {
      const response = await axios.post("http://localhost:4000/order", {
        userId: user.id, // Pastikan ini mengirim angka
        produkId: produkId,
        total: harga
      });
      
      alert("✅ " + response.data.msg);
    } catch (error) {
      // Menangkap pesan error dari backend (seperti "Akses Ditolak!")
      alert("Gagal order: " + (error.response?.data?.msg || "Terjadi kesalahan"));
      
      // Kalau ditolak karena gak valid, paksa logout
      if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.removeItem("user");
          setUser(null);
          router.push("/login");
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-blue-600 font-bold">Sedang memuat kantin... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* --- BAGIAN NAVBAR (PANGGIL DISINI) --- */}
      {/* Kita kirim data 'user' dan fungsi 'loadUser' ke Navbar biar sinkron */}
      <Navbar user={user} refreshUser={loadUser} />

      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        
        {/* --- BANNER SAMBUTAN --- */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white mb-8 shadow-xl flex justify-between items-center relative overflow-hidden">
          <div className="z-10">
            <h2 className="text-3xl font-bold mb-2">
              Lapar, {user ? user.nama.split(' ')[0] : 'Kawan'}? 😋
            </h2>
            <p className="text-blue-100">
              {user ? "Pesan makanan kantin tanpa antri, langsung dari HP!" : "Login dulu biar bisa pesan makanan enak!"}
            </p>
          </div>
          <div className="text-8xl opacity-20 absolute right-4 -bottom-4 rotate-12">🍔</div>
        </div>

        {/* --- JUDUL MENU --- */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3">
          Menu Hari Ini
        </h3>

        {/* --- GRID DAFTAR MAKANAN --- */}
        {menus.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">Belum ada menu yang tersedia hari ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menus.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col">
                
                {/* Gambar Makanan (Placeholder kalau kosong) */}
                <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-4xl">
                   {item.gambar !== "-" ? <img src={`http://localhost:4000/uploads/${item.gambar}`} alt={item.nama} className="w-full h-full object-cover"/> : "🍲"}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.nama}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                      Tersedia
                    </span>
                  </div>
                  
                  <p className="text-orange-600 font-extrabold text-xl mb-1">
                    Rp {item.harga.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">Stok: {item.stok} porsi</p>
                  
                  {/* Tombol Beli (Full Width di Bawah) */}
                  {/* Tombol Beli (Logika Baru) */}
                <button 
                  onClick={() => {
                    if (user) {
                      handleBeli(item.id, item.harga);
                    } else {
                      router.push("/login");
                    }
                  }}
                  className={`mt-auto w-full py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-md flex justify-center items-center gap-2 ${
                    user 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200" 
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200" 
                  }`}
                >
                  {/* Ikon & Teks berubah sesuai status, ditaruh DI DALAM tombol */}
                  {user ? (
                    <><span>Pesan Sekarang</span> 🛒</>
                  ) : (
                    <><span>Login & Pesan</span> 🔐</>
                  )}
                </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}