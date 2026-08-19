"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/components/ToastProvider";

export default function SettingsPage() {
  const { showToast, showConfirm } = useUi();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then(setValues);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi basic
    if (!values.wa_marketing_number?.trim()) return showToast("error", "Nomor WhatsApp wajib diisi.");

    const ok = await showConfirm({
      title: "Simpan Pengaturan Portal",
      message: "Apakah Anda yakin ingin memperbarui konfigurasi sistem?",
      confirmLabel: "Simpan",
      cancelLabel: "Batal",
    });

    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal menyimpan pengaturan.");
      } else {
        showToast("success", "Pengaturan sistem berhasil diperbarui!");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
          Superadmin Portal
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Pengaturan Sistem
        </h1>
      </div>

      <div className="bg-slate-900/5 p-1 rounded-3xl border border-black/5 shadow-xl">
        <form onSubmit={handleSave} className="bg-white rounded-[calc(1.5rem-0.25rem)] p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
              Nomor WhatsApp Marketing (Format: 62812xxxxx)
            </label>
            <input
              required
              value={values.wa_marketing_number ?? ""}
              onChange={(e) => setValues({ ...values, wa_marketing_number: e.target.value })}
              placeholder="628123456789"
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
                Jam Kerja Mulai
              </label>
              <input 
                required
                value={values.jam_kerja_mulai ?? ""} 
                onChange={(e) => setValues({ ...values, jam_kerja_mulai: e.target.value })} 
                placeholder="09:00" 
                className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
                Jam Kerja Selesai
              </label>
              <input 
                required
                value={values.jam_kerja_selesai ?? ""} 
                onChange={(e) => setValues({ ...values, jam_kerja_selesai: e.target.value })} 
                placeholder="17:00" 
                className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
              Hari Operasional
            </label>
            <input 
              required
              value={values.jam_kerja_hari ?? ""} 
              onChange={(e) => setValues({ ...values, jam_kerja_hari: e.target.value })} 
              placeholder="Senin-Jumat" 
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full py-4.5 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-lg shadow-red-100 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span className="tracking-wider uppercase">Menyimpan...</span>
              </>
            ) : (
              <span className="tracking-wider uppercase">SIMPAN PENGATURAN</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
