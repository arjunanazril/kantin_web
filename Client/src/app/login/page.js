"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:4000/auth/login", {
        identifier,
        password,
      });

      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect berdasarkan role
      if (user.role === "penjual") {
        router.push("/kantin");
      } else {
        router.push("/menu");
      }

    } catch (error) {
      alert("Gagal Login: " + (error.response?.data?.msg || "Server Error"));
    } finally {
      setLoading(false);
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
            <label className="block text-sm font-medium text-gray-700">
              NISN (Siswa) / Username (Penjual)
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:ring-2 focus:ring-blue-500"
              placeholder="NISN atau username penjual"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Masuk"}
          </button>
        </form>

        <div className="space-y-2 text-center text-sm text-gray-600">
          <p>
            Siswa belum punya akun?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Daftar siswa
            </Link>
          </p>
          <p>
            Penjual kantin?{" "}
            <Link href="/mitra" className="font-medium text-orange-600 hover:text-orange-500">
              Daftar sebagai penjual
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
