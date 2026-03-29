"use client"; 
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Efek ganti teks dinamis ala video referensi
  const kataKunci = ["Gak Pake Antri", "Lebih Santai", "Tetap Dingin"];
  const [indexKata, setIndexKata] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);

    // Timer buat ganti-ganti teks & UI tiap 2.5 detik
    const interval = setInterval(() => {
      setIndexKata((prev) => (prev + 1) % kataKunci.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handlePesanSekarang = (e) => {
    e.preventDefault(); 
    if (isLoggedIn) {
      router.push("/dashboard"); 
    } else {
      router.push("/login");     
    }
  };

  // Varian animasi buat elemen yang muncul pas di-scroll
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden relative text-gray-800">
      
      {/* BACKGROUND DEKORASI */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, delay: 4 }}
        className="absolute bottom-[20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl"
      />

      {/* --- NAVBAR --- */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 flex justify-between items-center p-6 bg-white/70 backdrop-blur-md border-b border-white/20"
      >
        <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-tighter">
          Skagara<span className="text-orange-500">Canteen</span>
        </div>
        <div className="space-x-8 hidden md:flex font-medium text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition">Platform</Link>
          <Link href="/menu" className="hover:text-blue-600 transition">Menu Jajan</Link>
          <Link href="/mitra" className="hover:text-blue-600 transition">Solusi Mitra</Link>
        </div>
        <div>
          <Link href="/login" className="text-gray-700 font-bold hover:text-blue-600 transition px-4 py-2">
            Masuk / Daftar
          </Link>
        </div>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 container mx-auto px-6 pt-24 pb-32 text-center md:text-left flex flex-col md:flex-row items-center justify-between min-h-[90vh]">
        
        {/* BAGIAN KIRI (Teks Utama) */}
        <div className="md:w-1/2">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6"
          >
            Pesan Makanan <br />
            <span className="flex h-[80px] md:h-[100px] overflow-hidden">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={indexKata}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="block"
                  >
                    {kataKunci[indexKata]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-gray-500 text-lg md:text-xl mb-10 max-w-lg"
          >
            Platform simulasi pemesanan kantin. Didesain khusus untuk warga sekolah yang butuh efisiensi waktu istirahat.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <button 
              onClick={handlePesanSekarang} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform hover:-translate-y-1"
            >
              Request a demo
            </button>
          </motion.div>
        </div>

        {/* BAGIAN KANAN (UI Dinamis) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 mt-16 md:mt-0 flex justify-center perspective-1000"
        >
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              rotateX: [0, 5, 0],
              rotateY: [0, -5, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-80 h-80 md:w-[450px] md:h-[400px] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_rgba(31,38,135,0.1)] rounded-3xl overflow-hidden relative"
          >
             {/* Efek kilau */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-50 transform -rotate-45 translate-x-10 z-0"></div>
             
             {/* Konten UI yang berganti sinkron dengan teks */}
             <AnimatePresence mode="wait">
                <motion.div
                  key={indexKata}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 z-10 flex flex-col p-8"
                >
                  {/* KONDISI 1: Gak Pake Antri (Menu UI) */}
                  {indexKata === 0 && (
                    <div className="w-full h-full flex flex-col gap-4 justify-center">
                      <div className="w-1/3 h-8 bg-blue-500/20 rounded-lg mb-2"></div>
                      <div className="flex gap-4 items-center bg-white/50 p-3 rounded-2xl shadow-sm">
                        <div className="w-16 h-16 bg-blue-400/30 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-3/4 h-4 bg-gray-400/30 rounded-full"></div>
                          <div className="w-1/2 h-4 bg-gray-400/20 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center bg-white/50 p-3 rounded-2xl shadow-sm opacity-70">
                        <div className="w-16 h-16 bg-purple-400/30 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-3/4 h-4 bg-gray-400/30 rounded-full"></div>
                          <div className="w-1/2 h-4 bg-gray-400/20 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KONDISI 2: Lebih Santai (Success UI) */}
                  {indexKata === 1 && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                      <div className="w-28 h-28 bg-gradient-to-tr from-green-400/40 to-emerald-300/40 rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-5xl text-emerald-600/70">✓</span>
                      </div>
                      <div className="w-2/3 h-6 bg-green-500/20 rounded-full"></div>
                      <div className="w-1/2 h-4 bg-gray-400/20 rounded-full"></div>
                    </div>
                  )}

                  {/* KONDISI 3: Tetap Dingin (Dashboard Chart UI) */}
                  {indexKata === 2 && (
                    <div className="w-full h-full flex flex-col gap-4 justify-center">
                      <div className="flex justify-between items-end h-32 gap-3 mb-4 border-b border-gray-400/20 pb-2">
                        <div className="w-1/4 h-1/2 bg-gradient-to-t from-orange-400/40 to-transparent rounded-t-lg"></div>
                        <div className="w-1/4 h-full bg-gradient-to-t from-pink-500/40 to-transparent rounded-t-lg"></div>
                        <div className="w-1/4 h-3/4 bg-gradient-to-t from-purple-500/40 to-transparent rounded-t-lg"></div>
                        <div className="w-1/4 h-1/3 bg-gradient-to-t from-blue-400/40 to-transparent rounded-t-lg"></div>
                      </div>
                      <div className="w-full h-12 bg-white/50 rounded-xl shadow-sm"></div>
                    </div>
                  )}
                </motion.div>
             </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* --- FEATURE SECTION --- */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="relative z-10 bg-white/60 backdrop-blur-lg py-24 border-t border-white/50"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Kenapa Skagara<span className="text-orange-500">Canteen</span>?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Tinggalkan cara lama mengantri panjang di kantin. Nikmati waktu istirahatmu dengan lebih efisien.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-6">⚡</div>
              <h3 className="text-xl font-bold mb-3">Cepat & Praktis</h3>
              <p className="text-gray-500">Pesan makanan langsung dari kelas. Tinggal ambil saat jam istirahat tiba tanpa perlu berdesakan.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-xl shadow-purple-100/50 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-6">💳</div>
              <h3 className="text-xl font-bold mb-3">Pembayaran Digital</h3>
              <p className="text-gray-500">Dukung sistem pembayaran *cashless*. Gak perlu repot cari uang kembalian.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-xl shadow-orange-100/50 border border-gray-100">
              <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center text-2xl font-black mb-6">🍜</div>
              <h3 className="text-xl font-bold mb-3">Menu Terjamin</h3>
              <p className="text-gray-500">Penjual kantin menyiapkan pesanan sesuai jadwal ambilmu. Makanan dijamin fresh!</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* --- HOW IT WORKS SECTION --- */}
      <div className="relative z-10 py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16"
          >
            Cara Kerjanya Gampang Banget
          </motion.h2>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 relative">
            <motion.div initial={{ opacity:0, x: -30 }} whileInView={{ opacity:1, x:0 }} viewport={{once:true}} transition={{delay: 0.2}} className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-6 z-10">1</div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Pilih Menu</h4>
              <p className="text-gray-500 text-sm px-4">Buka web, lihat menu kantin favorit lu hari ini.</p>
            </motion.div>

            <motion.div initial={{ opacity:0, y: 30 }} whileInView={{ opacity:1, y:0 }} viewport={{once:true}} transition={{delay: 0.4}} className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-6 z-10">2</div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Pesan & Bayar</h4>
              <p className="text-gray-500 text-sm px-4">Selesaikan pesanan sebelum bel istirahat bunyi.</p>
            </motion.div>

            <motion.div initial={{ opacity:0, x: 30 }} whileInView={{ opacity:1, x:0 }} viewport={{once:true}} transition={{delay: 0.6}} className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-6 z-10">3</div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Ambil Pesanan</h4>
              <p className="text-gray-500 text-sm px-4">Tunjukin bukti pesanan, langsung bawa makanan lu!</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-200 py-10 mt-10">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} SkagaraCanteen. Platform pemesanan masa depan.</p>
        </div>
      </footer>

    </main>
  );
}