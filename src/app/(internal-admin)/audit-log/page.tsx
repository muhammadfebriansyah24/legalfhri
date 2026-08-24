"use client";

import { useEffect, useState } from "react";

type BatchRow = {
  id: number;
  user_id: number;
  nama_perusahaan: string;
  email: string;
  source_type: string;
  jumlah_token_awal: number;
  sisa_token: number;
  expiry_date: string;
  granted_by_name: string | null;
  catatan: string | null;
  created_at: string;
};

const SOURCE_LABEL: Record<string, string> = { free_trial: "Free Trial", package: "Paket", manual: "Manual" };
const SOURCE_COLORS: Record<string, string> = {
  free_trial: "bg-blue-50 text-blue-700 border-blue-100",
  package: "bg-emerald-50 text-emerald-700 border-emerald-100",
  manual: "bg-purple-50 text-purple-700 border-purple-100",
};

export default function AuditLogPage() {
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (query: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/token-batches?q=${encodeURIComponent(query)}`);
      const data = await r.json();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(""); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const isExpired = (d: string) => new Date(d) < new Date();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
          Internal Audit
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Audit Log Token
        </h1>
      </div>

      {/* Search Input bar */}
      <div className="max-w-md relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama perusahaan, email..."
          className="w-full bg-white border border-slate-200 rounded-full px-5 py-3 text-sm text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 focus:border-transparent transition-all duration-300 shadow-sm"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="block w-4 h-4 border-2 border-[#DC0017] border-t-transparent rounded-full animate-spin"></span>
          </div>
        )}
      </div>

      {/* Audit Log Table container with premium details */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">User / Perusahaan</th>
                <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sumber</th>
                <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Awal</th>
                <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Sisa</th>
                <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Masa Berlaku</th>
                <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Diberikan Oleh</th>
                <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Catatan</th>
                <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4.5">
                    <p className="font-bold text-[#0B2A4A]">{r.nama_perusahaan}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{r.email}</p>
                  </td>
                  <td className="p-4.5">
                    <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${SOURCE_COLORS[r.source_type] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
                      {SOURCE_LABEL[r.source_type]}
                    </span>
                  </td>
                  <td className="p-4.5 font-bold text-center text-slate-500">{r.jumlah_token_awal}</td>
                  <td className="p-4.5 font-extrabold text-center text-[#0B2A4A]">{r.sisa_token}</td>
                  <td className="p-4.5">
                    <span className={`font-semibold ${isExpired(r.expiry_date) ? "text-slate-400 line-through" : "text-[#0B2A4A]"}`}>
                      {new Date(r.expiry_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {isExpired(r.expiry_date) && (
                      <span className="ml-1.5 text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-150 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        expired
                      </span>
                    )}
                  </td>
                  <td className="p-4.5 font-semibold text-slate-650">{r.granted_by_name ?? "Sistem"}</td>
                  <td className="p-4.5 max-w-[200px] truncate text-slate-500 font-medium" title={r.catatan ?? ""}>
                    {r.catatan ?? "-"}
                  </td>
                  <td className="p-4.5 text-slate-400 font-medium">
                    {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-12 text-center flex flex-col items-center justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tidak ada log token ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
