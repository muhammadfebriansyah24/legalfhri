"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
      } else {
        alert(data.message);
        if (data.role === 'user') {
          router.push('/dashboard');
        } else {
          router.push('/admin');
        }
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100">
        
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#DC0017] mb-2">FHRI ADMIN</p>
          <h1 className="text-3xl font-extrabold text-[#0B2A4A] mb-2">Login Portal</h1>
          <p className="text-slate-500 text-sm">Silakan masuk menggunakan kredensial admin Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#0B2A4A] mb-2 uppercase">Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="fiqlacampus24@gmail.com" 
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B2A4A] mb-2 uppercase">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••" 
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/50 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-400 text-white font-bold rounded-full px-6 py-4 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "MEMERIKSA..." : "LOGIN DASHBOARD"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Belum memiliki akun? <a href="/register" className="font-bold text-[#DC0017] hover:underline">Daftar Di Sini</a>
          </p>
        </div>

      </div>
    </div>
  );
}