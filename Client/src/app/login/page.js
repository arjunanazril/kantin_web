"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link"; 

export default function LoginPage() {
  const [inputUser, setInputUser] = useState(""); // Bisa Nama atau NISN
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Perhatikan: kuncinya sekarang 'identifier', bukan 'nisn'
      const response = await axios.post("http://localhost:4000/login", {
        identifier: inputUser, 
        password: password,
      });

      localStorage.setItem("user", JSON.stringify(response.data.user));
      alert("Login Berhasil! Selamat datang " + response.data.user.nama);
      
      router.push("/dashboard"); 

    } catch (error) {
      alert("Gagal Login: " + (error.response?.data?.msg || "Server Error"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Login Kantin 🍢
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">NISN atau Nama Lengkap</label>
            <input
              type="text"
              value={inputUser}
              onChange={(e) => setInputUser(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 12345 atau Budi Lapar"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>

          <button type="submit" className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            Masuk
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Daftar dulu
          </Link>
        </p>
      </div>
    </div>
  );
}