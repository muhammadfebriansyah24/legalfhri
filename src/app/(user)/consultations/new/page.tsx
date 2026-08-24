"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUi } from "@/components/ToastProvider";

export default function NewConsultationPage() {
  const router = useRouter();
  const { showToast } = useUi();
  const [topik, setTopik] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.set("topik", topik);
      form.set("deskripsi_awal", deskripsi);
      if (file) form.set("berkas", file);

      const res = await fetch("/api/consultations", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal membuat sesi konsultasi.");
      } else {
        showToast("success", "Konsultasi berhasil dibuat!");
        router.push(`/consultations/${data.id}`);
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
          Konsultasi Baru
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Buat Konsultasi
        </h1>
      </div>

      {/* Double Bezel Card Wrapper */}
      <div className="bg-slate-900/5 p-1 rounded-3xl border border-black/5 shadow-xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-[calc(1.5rem-0.25rem)] p-8 space-y-6">
          <div>
            <label htmlFor="topik" className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
              Topik Permasalahan
            </label>
            <input
              id="topik"
              required
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Review Kontrak Perjanjian Vendor"
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300"
            />
          </div>

          <div>
            <label htmlFor="deskripsi" className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
              Deskripsi Kronologi / Kebutuhan
            </label>
            <textarea
              id="deskripsi"
              required
              rows={6}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan secara detail mengenai latar belakang, poin-poin permasalahan hukum, atau kebutuhan yang ingin Anda konsultasikan..."
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300 resize-y leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
              Unggah Berkas Pendukung (Opsional, Maks. 5MB)
            </label>
            
            {/* Premium File Upload Interface */}
            <div className="relative border-2 border-dashed border-slate-200 hover:border-[#0B2A4A] rounded-2xl p-6 transition-colors group bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <svg className="w-8 h-8 text-slate-400 group-hover:text-[#0B2A4A] mb-2.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {file ? (
                <div className="text-center z-20">
                  <p className="text-xs font-bold text-[#0B2A4A] max-w-xs truncate mb-1">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {(file.size / 1024 / 1024).toFixed(2)} MB — Klik untuk mengganti
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-500 group-hover:text-[#0B2A4A] transition-colors mb-0.5">
                    Tarik berkas Anda ke sini, atau klik untuk mencari berkas
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Mendukung PDF, PNG, atau JPG (Maks. 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full py-4.5 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-lg shadow-red-100"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span className="tracking-wider uppercase">Mengirim Konsultasi...</span>
              </>
            ) : (
              <span className="tracking-wider uppercase">KIRIM KONSULTASI</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
