"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function KantinPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ nama: "", harga: "", stok: "" });
  const [gambarFile, setGambarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (!data) { router.push("/login"); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== "penjual") { router.push("/dashboard"); return; }
    setUser(parsed);
    fetchProduk(parsed.kantinId);
  }, []);

  const fetchProduk = async (kantinId) => {
    try {
      const res = await axios.get(`http://localhost:4000/produk?kantinId=${kantinId}`);
      setProduk(res.data);
    } catch (e) {
      console.error("Gagal ambil produk:", e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ nama: "", harga: "", stok: "" });
    setGambarFile(null);
    setPreview(null);
    setEditTarget(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditTarget(item);
    setForm({ nama: item.nama, harga: item.harga, stok: item.stok });
    setPreview(item.gambar && item.gambar !== "-" ? `http://localhost:4000/uploads/${item.gambar}` : null);
    setGambarFile(null);
    setShowForm(true);
  };

  const handleGambarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGambarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const fd = new FormData();
    fd.append("nama", form.nama);
    fd.append("harga", form.harga);
    fd.append("stok", form.stok);
    fd.append("kantinId", user.kantinId);
    if (gambarFile) fd.append("gambar", gambarFile);

    try {
      if (editTarget) {
        await axios.put(`http://localhost:4000/produk/${editTarget.id}`, fd);
        alert("Menu berhasil diupdate!");
      } else {
        await axios.post("http://localhost:4000/produk", fd);
        alert("Menu berhasil ditambahkan!");
      }
      resetForm();
      fetchProduk(user.kantinId);
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.msg || "Server Error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleHapus = async (id) => {
    if (!confirm("Yakin mau hapus menu ini?")) return;
    try {
      await axios.delete(`http://localhost:4000/produk/${id}`);
      setProduk((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Gagal hapus: " + (err.response?.data?.msg || "Server Error"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <p className="text-orange-600 font-bold text-lg">Memuat dashboard... ⏳</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-tighter">
          Skagara<span className="text-orange-500">Canteen</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800">{user?.nama}</p>
            <p className="text-xs text-orange-500 font-medium">{user?.namaKantin}</p>
          </div>
          <button onClick={handleLogout} className="text-red-500 text-sm font-medium hover:text-red-700 hover:underline px-2 py-1">
            Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Dashboard Kantin 🍱</h2>
            <p className="text-gray-500 text-sm mt-1">Kelola menu {user?.namaKantin} kamu di sini</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
          >
            + Tambah Menu
          </button>
        </div>

        {/* FORM TAMBAH / EDIT */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-5">
                {editTarget ? "✏️ Edit Menu" : "➕ Tambah Menu Baru"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Preview gambar */}
                <div
                  onClick={() => fileRef.current.click()}
                  className="w-full h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden"
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <p className="text-3xl mb-1">📷</p>
                      <p className="text-sm">Klik untuk pilih foto menu</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileRef} onChange={handleGambarChange} className="hidden" accept="image/*" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-blue-500"
                    placeholder="Contoh: Nasi Goreng Spesial"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      value={form.harga}
                      onChange={(e) => setForm({ ...form, harga: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-blue-500"
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok (porsi)</label>
                    <input
                      type="number"
                      value={form.stok}
                      onChange={(e) => setForm({ ...form, stok: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-blue-500"
                      placeholder="20"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={resetForm} className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">
                    Batal
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
                    {submitting ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Tambahkan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DAFTAR PRODUK */}
        {produk.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-gray-500 font-medium">Belum ada menu. Yuk tambahkan!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {produk.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {item.gambar && item.gambar !== "-" ? (
                    <img src={`http://localhost:4000/uploads/${item.gambar}`} alt={item.nama} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🍲</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{item.nama}</h3>
                  <p className="text-blue-600 font-extrabold text-xl">Rp {parseInt(item.harga).toLocaleString("id-ID")}</p>
                  <p className="text-sm text-gray-400 mb-4">Stok: {item.stok} porsi</p>
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 py-2 bg-amber-100 text-amber-700 font-bold rounded-lg hover:bg-amber-200 transition text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleHapus(item.id)}
                      className="flex-1 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition text-sm"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
