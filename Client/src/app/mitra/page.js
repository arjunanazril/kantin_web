"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MitraPage() {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namaKantin, setNamaKantin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:4000/auth/register/penjual", {
        nama,
        username,
        password,
        namaKantin,
      });

      alert("Yeay! Akun penjual berhasil dibuat. Silakan login!");
      router.push("/login");

    } catch (error) {
      alert("Gagal Daftar: " + (error.response?.data?.msg || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-orange-700 mb-2">
          Daftar Sebagai Penjual 🍱
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Buka lapak kantin kamu di sini!
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nama Penjual</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-orange-500 text-black"
              placeholder="Contoh: Bu Sari"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-orange-500 text-black"
              placeholder="Contoh: kantin_bu_sari"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Dipakai untuk login, tanpa spasi</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Nama Kantin</label>
            <input
              type="text"
              value={namaKantin}
              onChange={(e) => setNamaKantin(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-orange-500 text-black"
              placeholder="Contoh: Kantin Bu Sari"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-orange-500 text-black"
              placeholder="Bikin yang kuat ya!"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-orange-600 font-bold">Login aja</Link>
        </p>
      </div>
    </div>
  );
}
