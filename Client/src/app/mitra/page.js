'use client';
import Link from 'next/link';

export default function MitraPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
          Punya Kantin di Sekolah? <br />
          <span className="text-blue-600">Gabung Digital Sekarang!</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          <div className="p-6 border rounded-xl bg-blue-50">
            <h3 className="font-bold text-xl mb-2">📈 Omzet Naik</h3>
            <p>Jangkau siswa yang malas antri. Pesanan masuk otomatis ke HP.</p>
          </div>
          <div className="p-6 border rounded-xl bg-blue-50">
            <h3 className="font-bold text-xl mb-2">⚡ Efisien</h3>
            <p>Gak perlu teriak-teriak manggil siswa. Notifikasi otomatis saat makanan siap.</p>
          </div>
          <div className="p-6 border rounded-xl bg-blue-50">
            <h3 className="font-bold text-xl mb-2">🔒 Data Aman</h3>
            <p>Hanya melayani siswa & guru terverifikasi dari database sekolah.</p>
          </div>
        </div>

        <div className="bg-gray-100 p-8 rounded-2xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Cara Bergabung</h2>
          <p className="text-gray-600 mb-6">
            Karena ini sistem tertutup (Satu Gedung), pendaftaran kantin dilakukan manual oleh Admin TJKT.
          </p>
          <a 
            href="#"
            onClick={() => alert("Hubungi Arjuna di XI TJKT 1")}
            className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition"
          >
            WhatsApp Admin (Arjuna)
          </a>
        </div>
      </div>
    </div>
  );
}