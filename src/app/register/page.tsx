"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [tipeAkun, setTipeAkun] = useState("perusahaan");
  
  // State untuk menyimpan ketikan user
  const [formData, setFormData] = useState({
    nama: "",
    no_whatsapp: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  // Fungsi untuk menangani saat tombol Daftar diklik
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman refresh
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error); // Tampilkan pesan error dari backend
      } else {
        alert(data.message); // Tampilkan sukses
        router.push('/login'); // Arahkan otomatis ke halaman login
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100">
        
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#DC0017] mb-2">Pendaftaran Klien Baru</p>
          <h1 className="text-3xl font-extrabold text-[#0B2A4A] mb-2">Buat Akun</h1>
          <p className="text-slate-500 text-sm">Daftarkan diri atau perusahaan Anda untuk mulai berkonsultasi dengan tim legal FHRI.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex bg-[#EFF6FF] rounded-xl p-1 mb-6">
            <button type="button" onClick={() => setTipeAkun("perusahaan")} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${tipeAkun === "perusahaan" ? "bg-[#0B2A4A] text-white shadow-md" : "text-slate-500 hover:text-[#0B2A4A]"}`}>Perusahaan</button>
            <button type="button" onClick={() => setTipeAkun("perorangan")} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${tipeAkun === "perorangan" ? "bg-[#0B2A4A] text-white shadow-md" : "text-slate-500 hover:text-[#0B2A4A]"}`}>Perorangan</button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B2A4A] mb-2 uppercase">{tipeAkun === "perusahaan" ? "Nama Perusahaan" : "Nama Lengkap"}</label>
            <input required type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} placeholder={tipeAkun === "perusahaan" ? "PT First HR Indonesia" : "Budi Santoso"} className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/50" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B2A4A] mb-2 uppercase">Nomor WhatsApp</label>
            <input required type="tel" value={formData.no_whatsapp} onChange={(e) => setFormData({...formData, no_whatsapp: e.target.value})} placeholder="081234567890" className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/50" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B2A4A] mb-2 uppercase">Email {tipeAkun === "perusahaan" ? "Perusahaan" : "Pribadi"}</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder={tipeAkun === "perusahaan" ? "legal@perusahaan.com" : "budi@gmail.com"} className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/50" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B2A4A] mb-2 uppercase">Password</label>
            <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/50" />
          </div>

          <div className="flex items-start gap-2 mt-4 text-sm text-slate-500">
            <input type="checkbox" required className="mt-1 accent-[#DC0017]" />
            <p>Saya menyetujui <a href="#" className="font-bold text-[#DC0017] hover:underline">Syarat & Ketentuan</a> yang berlaku di FHRI.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-6 bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-400 text-white font-bold rounded-full px-6 py-4 transition-colors flex items-center justify-center gap-2">
            {loading ? "MEMPROSES..." : "DAFTARKAN AKUN"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">Sudah memiliki akun? <a href="/login" className="font-bold text-[#DC0017] hover:underline">Login di sini</a></p>
        </div>
      </div>
    </div>
  );
}