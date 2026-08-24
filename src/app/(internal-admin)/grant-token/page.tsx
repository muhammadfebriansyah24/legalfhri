"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/components/ToastProvider";

type UserResult = { id: number; nama_perusahaan: string; email: string; no_whatsapp: string };
type Package = { id: number; nama_paket: string; jumlah_token: number; harga: string; masa_berlaku_hari: number };

export default function GrantTokenPage() {
  const { showToast, showConfirm } = useUi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [mode, setMode] = useState<"package" | "manual">("package");
  const [packageId, setPackageId] = useState<number | null>(null);
  const [jumlahToken, setJumlahToken] = useState("");
  const [masaBerlaku, setMasaBerlaku] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/packages").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setPackages(data.filter((p: Package & { status_aktif: number }) => p.status_aktif));
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!query.trim()) { setResults([]); return; }
      fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`).then((r) => r.json()).then(setResults);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return showToast("error", "Pilih user terlebih dahulu.");
    
    // Validasi input manual
    if (mode === "manual") {
      if (!jumlahToken || Number(jumlahToken) <= 0) return showToast("error", "Jumlah token harus lebih dari 0.");
      if (!masaBerlaku || Number(masaBerlaku) <= 0) return showToast("error", "Masa berlaku harus lebih dari 0 hari.");
      if (!catatan.trim()) return showToast("error", "Catatan wajib diisi untuk grant manual.");
    } else {
      if (!packageId) return showToast("error", "Pilih paket terlebih dahulu.");
    }

    const confirmMessage = mode === "package" 
      ? `Apakah Anda yakin ingin memberikan paket ke ${selectedUser.nama_perusahaan}?`
      : `Apakah Anda yakin ingin memberikan ${jumlahToken} token manual ke ${selectedUser.nama_perusahaan}?`;

    const ok = await showConfirm({
      title: "Konfirmasi Pemberian Token",
      message: confirmMessage,
      confirmLabel: "Ya, Berikan",
      cancelLabel: "Batal"
    });

    if (!ok) return;

    setLoading(true);
    try {
      const body: Record<string, unknown> = { userId: selectedUser.id, catatan };
      if (mode === "package") {
        body.packageId = packageId;
      } else {
        body.jumlahToken = Number(jumlahToken);
        body.masaBerlakuHari = Number(masaBerlaku);
      }
      const res = await fetch("/api/admin/grant-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal memberikan token.");
      } else {
        showToast("success", "Token berhasil diberikan ke user!");
        setSelectedUser(null);
        setQuery("");
        setPackageId(null);
        setJumlahToken("");
        setMasaBerlaku("");
        setCatatan("");
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
          Manajemen Token
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Grant Token
        </h1>
      </div>

      <div className="bg-slate-900/5 p-1 rounded-3xl border border-black/5 shadow-xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-[calc(1.5rem-0.25rem)] p-8 space-y-6">
          
          {/* User selector input */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
              Cari User (Email / No. WhatsApp / Nama)
            </label>
            {selectedUser ? (
              <div className="flex items-center justify-between bg-[#EFF6FF] rounded-xl px-4 py-3 border border-blue-100">
                <div className="min-w-0 pr-4">
                  <p className="text-sm text-[#0B2A4A] font-bold truncate">{selectedUser.nama_perusahaan}</p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{selectedUser.email}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedUser(null)} 
                  className="text-xs text-[#DC0017] font-extrabold hover:underline px-3 py-1 bg-white rounded-lg border border-slate-100 shrink-0"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ketik email, nomor WA, atau nama..."
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300"
                />
                
                {/* Search result dropdown */}
                {results.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl divide-y divide-slate-50 overflow-hidden z-20 animate-scale-up">
                    {results.map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => { setSelectedUser(u); setResults([]); }}
                        className="w-full text-left px-4 py-3 text-xs hover:bg-[#EFF6FF]/50 transition-colors"
                      >
                        <span className="font-bold text-[#0B2A4A] block">{u.nama_perusahaan}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{u.email} · {u.no_whatsapp}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mode toggle selector squircle */}
          <div className="flex bg-[#EFF6FF] rounded-xl p-1 border border-slate-100">
            <button 
              type="button" 
              onClick={() => setMode("package")} 
              className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all duration-300 ${
                mode === "package" 
                  ? "bg-[#0B2A4A] text-white shadow-[0_2px_8px_-2px_rgba(11,42,74,0.12)]" 
                  : "text-slate-500 hover:text-[#0B2A4A]"
              }`}
            >
              Jalur Paket
            </button>
            <button 
              type="button" 
              onClick={() => setMode("manual")} 
              className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all duration-300 ${
                mode === "manual" 
                  ? "bg-[#0B2A4A] text-white shadow-[0_2px_8px_-2px_rgba(11,42,74,0.12)]" 
                  : "text-slate-500 hover:text-[#0B2A4A]"
              }`}
            >
              Grant Manual
            </button>
          </div>

          {/* Render package path selection */}
          {mode === "package" ? (
            <div>
              <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
                Pilih Paket
              </label>
              <select
                value={packageId ?? ""}
                onChange={(e) => setPackageId(Number(e.target.value))}
                className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-xs text-[#0B2A4A] font-bold focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300"
              >
                <option value="">-- Pilih Paket Token --</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_paket} ({p.jumlah_token} Token — Rp {Number(p.harga).toLocaleString("id-ID")} — {p.masa_berlaku_hari} Hari)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
                  Jumlah Token
                </label>
                <input 
                  type="number" 
                  min={1} 
                  value={jumlahToken} 
                  onChange={(e) => setJumlahToken(e.target.value)} 
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
                  Masa Berlaku (Hari)
                </label>
                <input 
                  type="number" 
                  min={1} 
                  value={masaBerlaku} 
                  onChange={(e) => setMasaBerlaku(e.target.value)} 
                  className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
                />
              </div>
            </div>
          )}

          {/* Catatan / Alasan */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2.5 uppercase tracking-wider">
              Catatan {mode === "manual" && <span className="text-[#DC0017] font-extrabold">(Wajib)</span>}
            </label>
            <textarea
              required={mode === "manual"}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder={mode === "manual" ? "Alasan pemberian token manual..." : "Referensi transfer, data invoice, dll..."}
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full py-4.5 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-lg shadow-red-100"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span className="tracking-wider uppercase">Memproses...</span>
              </>
            ) : (
              <span className="tracking-wider uppercase">BERIKAN TOKEN</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
