"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUi } from "@/components/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useUi();
  const [tipeAkun, setTipeAkun] = useState("perusahaan");
  
  const [formData, setFormData] = useState({
    nama: "",
    no_whatsapp: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Gagal mendaftarkan akun.");
      } else {
        showToast("success", data.message || "Pendaftaran sukses! Silakan login.");
        router.push('/login');
      }
    } catch {
      showToast("error", 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background Ambience Dots & Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,0,23,0.06),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#EFF6FF] blur-[120px] opacity-60 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md animate-scale-up">
        {/* Double-Bezel wrapping */}
        <div className="bg-slate-900/5 p-1.5 rounded-[2rem] border border-black/5 shadow-2xl">
          <div className="bg-white rounded-[calc(2rem-0.375rem)] p-8 border border-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            
            <div className="mb-8">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] block mb-2">
                Pendaftaran Klien Baru
              </span>
              <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mb-2">
                Buat Akun
              </h1>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                Daftarkan diri atau perusahaan Anda untuk mulai berkonsultasi dengan tim legal FHRI.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Account Type Selector Squircle Toggle */}
              <div className="flex bg-[#EFF6FF] rounded-xl p-1 mb-6 border border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setTipeAkun("perusahaan")} 
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all duration-300 ${
                    tipeAkun === "perusahaan" 
                      ? "bg-[#0B2A4A] text-white shadow-[0_2px_8px_-2px_rgba(11,42,74,0.12)]" 
                      : "text-slate-500 hover:text-[#0B2A4A]"
                  }`}
                >
                  Perusahaan
                </button>
                <button 
                  type="button" 
                  onClick={() => setTipeAkun("perorangan")} 
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all duration-300 ${
                    tipeAkun === "perorangan" 
                      ? "bg-[#0B2A4A] text-white shadow-[0_2px_8px_-2px_rgba(11,42,74,0.12)]" 
                      : "text-slate-500 hover:text-[#0B2A4A]"
                  }`}
                >
                  Perorangan
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">
                  {tipeAkun === "perusahaan" ? "Nama Perusahaan" : "Nama Lengkap"}
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.nama} 
                  onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                  placeholder={tipeAkun === "perusahaan" ? "PT First HR Indonesia" : "Budi Santoso"} 
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">
                  Nomor WhatsApp
                </label>
                <input 
                  required 
                  type="tel" 
                  value={formData.no_whatsapp} 
                  onChange={(e) => setFormData({...formData, no_whatsapp: e.target.value})} 
                  placeholder="081234567890" 
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">
                  Email {tipeAkun === "perusahaan" ? "Perusahaan" : "Pribadi"}
                </label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder={tipeAkun === "perusahaan" ? "legal@perusahaan.com" : "budi@gmail.com"} 
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">
                  Password
                </label>
                <input 
                  required 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  placeholder="••••••••" 
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
                />
              </div>

              <div className="flex items-start gap-3 mt-4 text-xs text-slate-500 font-medium leading-relaxed">
                <input 
                  type="checkbox" 
                  required 
                  className="mt-1 accent-[#DC0017] w-4 h-4 rounded border-slate-300 text-[#DC0017] focus:ring-[#DC0017]/50" 
                />
                <p>
                  Saya menyetujui{" "}
                  <a href="/disclaimer" target="_blank" className="font-extrabold text-[#DC0017] hover:underline">
                    Legal Disclaimer & Syarat Ketentuan
                  </a>{" "}
                  yang berlaku di FHRI.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full mt-6 bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full py-4 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-lg shadow-red-100"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span className="tracking-wider">MEMPROSES...</span>
                  </>
                ) : (
                  <span className="tracking-wider">DAFTARKAN AKUN</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Sudah memiliki akun?{" "}
                <a href="/login" className="font-extrabold text-[#DC0017] hover:underline">
                  Login di sini
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
