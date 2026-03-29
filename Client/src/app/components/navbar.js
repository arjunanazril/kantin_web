"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Navbar({ user, refreshUser }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  
  // 1. BUAT REMOT KONTROL BUAT INPUT FILE
  const fileInputRef = useRef(null);

  // 2. FUNGSI PAS GAMBAR DIKLIK -> SURUH REMOT NYALAIN INPUT FILE
  const handleKlikGambar = () => {
    fileInputRef.current.click();
  };

  const handleGantiFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    setUploading(true);
    try {
      const res = await axios.post(`http://localhost:4000/upload-avatar/${user.id}`, formData);
      alert("Foto profil baru terpasang! 😎");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (refreshUser) refreshUser();
    } catch (error) {
      alert("Gagal upload foto");
    }
    setUploading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (refreshUser) refreshUser();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <h1 className="text-xl font-extrabold text-blue-600 tracking-tighter cursor-pointer">
        KANTIN<span className="text-orange-500">APP</span>
      </h1>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800">{user.nama}</p>
              <p className="text-xs text-gray-500">{user.nisn}</p>
            </div>

            {/* FOTO PROFIL (Sekarang porsinya pas, gak segede gaban) */}
            <img 
              src={user.foto === 'default.png' || !user.foto 
                ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                : `http://localhost:4000/uploads/${user.foto}`} 
              alt="Profile" 
              onClick={handleKlikGambar} // Pas diklik, manggil remot kontrol
              className={`w-12 h-12 rounded-full border-2 border-blue-500 object-cover cursor-pointer hover:opacity-75 transition-opacity ${uploading ? 'animate-pulse' : ''}`}
              title="Klik untuk ganti foto"
            />
            
            {/* INPUT FILE (Beneran disembunyikan pakai class 'hidden') */}
            <input 
              type="file" 
              ref={fileInputRef} // Pasang remotnya disini
              onChange={handleGantiFoto} 
              className="hidden" 
              accept="image/*"
            />
            
            {/* TOMBOL KELUAR (Sekarang udah aman dari bayang-bayang input) */}
            <button 
              onClick={handleLogout} 
              className="text-red-500 text-sm font-medium hover:text-red-700 hover:underline px-2 py-1"
            >
              Keluar
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 opacity-50">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png" 
                className="w-8 h-8 rounded-full grayscale" 
                alt="Guest" 
              />
              <span className="text-sm text-gray-500">Tamu</span>
            </div>
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-700 shadow-lg">
              Login Dong
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}