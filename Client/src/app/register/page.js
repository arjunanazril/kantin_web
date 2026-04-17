"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [nama, setNama] = useState("");
  const [nisn, setNisn] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:4000/auth/register/siswa", {
        nama,
        nisn,
        password,
      });

      alert("Hore! Berhasil daftar. Silakan Login.");
      router.push("/login");

    } catch (error) {
      alert("Gagal Daftar: " + (error.response?.data?.msg || "Cek Console Browser"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
          Daftar Akun Siswa 📝
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-blue-500 text-black"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">NISN</label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-blue-500 text-black"
              placeholder="Contoh: 12345678"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-blue-500 text-black"
              placeholder="Rahasia donk"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-600 font-bold">Login aja</Link>
        </p>
        <p className="mt-2 text-center text-gray-600">
          Penjual kantin?{" "}
          <Link href="/mitra" className="text-orange-600 font-bold">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
