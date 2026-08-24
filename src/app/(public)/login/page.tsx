"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUi } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useUi();
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
        showToast("error", data.error);
      } else {
        showToast("success", data.message || "Login berhasil!");
        const homeByRole: Record<string, string> = {
          user: '/dashboard',
          admin_legal: '/inbox',
          digital_marketing: '/grant-token',
          superadmin: '/grant-token',
        };
        router.push(homeByRole[data.role] ?? '/login');
        router.refresh();
      }
    } catch {
      showToast("error", 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience Dots & Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,0,23,0.06),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#EFF6FF] blur-[120px] opacity-60 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md animate-scale-up">
        {/* Double-Bezel outer wrapping */}
        <div className="bg-slate-900/5 p-1.5 rounded-[2rem] border border-black/5 shadow-2xl">
          <div className="bg-white rounded-[calc(2rem-0.375rem)] p-8 border border-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            
            <div className="mb-8">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] block mb-2">
                FIRST HR INDONESIA
              </span>
              <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mb-2">
                Login Portal
              </h1>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                Silakan masuk menggunakan akun anda yang sudah terdaftar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">
                  Email
                </label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="emailname@gmail.com" 
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">
                  Password
                </label>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full py-4 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-lg shadow-red-100"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span className="tracking-wider">MEMERIKSA...</span>
                  </>
                ) : (
                  <span className="tracking-wider">LOGIN DASHBOARD</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Belum memiliki akun?{" "}
                <a href="/register" className="font-extrabold text-[#DC0017] hover:underline">
                  Daftar Di Sini
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
