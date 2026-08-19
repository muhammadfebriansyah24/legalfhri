import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getTotalBalance, getActiveBatches } from "@/lib/tokenBalance";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

const SOURCE_LABEL: Record<string, string> = {
  free_trial: "Free Trial",
  package: "Paket",
  manual: "Manual Grant",
};

const SOURCE_COLORS: Record<string, string> = {
  free_trial: "bg-blue-50 text-blue-700 border-blue-100",
  package: "bg-emerald-50 text-emerald-700 border-emerald-100",
  manual: "bg-purple-50 text-purple-700 border-purple-100",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [total, batches, settingsRows, activeConsultations] = await Promise.all([
    getTotalBalance(session!.id),
    getActiveBatches(session!.id),
    pool.query<RowDataPacket[]>(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'wa_marketing_number'"
    ),
    pool.query<RowDataPacket[]>(
      "SELECT id, topik, status, created_at FROM consultations WHERE user_id = ? AND status IN ('waiting', 'active') ORDER BY created_at DESC",
      [session!.id]
    ),
  ]);

  const waNumber = settingsRows[0][0]?.setting_value || "";
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo, saya ingin top-up token konsultasi FHRI Legal Advisory.")}` : "#";
  const activeCases = activeConsultations[0] as { id: number; topik: string; status: "waiting" | "active"; created_at: string }[];
  const hasActiveCase = activeCases.length > 0;

  // Hitung batch yang akan kedaluwarsa dalam H-3
  const expiringSoonBatches = batches.filter((b) => {
    const expiry = new Date(b.expiry_date);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header section with whitespace */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
          Overview Portal
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Halo, {session!.nama}
        </h1>
      </div>

      {/* Warnings & Expirations (tactile and modern) */}
      {expiringSoonBatches.length > 0 && (
        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-5 flex gap-4 shadow-sm animate-slide-in">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 shadow-inner">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-900 leading-tight">
              Perhatian: Token Segera Kedaluwarsa (H-3)
            </h4>
            <div className="space-y-1 text-xs text-amber-700/90 font-medium leading-relaxed">
              {expiringSoonBatches.map((b) => {
                const diffTime = new Date(b.expiry_date).getTime() - new Date().getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return (
                  <p key={b.id}>
                    Batch <span className="font-bold">{SOURCE_LABEL[b.source_type]}</span> sebanyak <span className="font-bold">{b.sisa_token} token</span> akan kedaluwarsa dalam <span className="font-bold">{diffDays} hari</span> ({new Date(b.expiry_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}).
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {total <= 0 && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-150 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 shadow-sm animate-slide-in">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#DC0017] shrink-0 shadow-inner">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-red-950 leading-tight">Token Anda habis</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Hubungi Tim Digital Marketing untuk melakukan top-up token baru.</p>
            </div>
          </div>
          <a
            href={waLink}
            target="_blank"
            className="bg-[#DC0017] hover:bg-red-700 text-white text-xs font-bold rounded-full px-6 py-3.5 transition-all duration-300 shadow-lg shadow-red-100 active:scale-98"
          >
            Top-Up via WhatsApp
          </a>
        </div>
      )}

      {/* Grid containing balance and CTA action */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Token Balance Card */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] p-8 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] rounded-full bg-[#EFF6FF] opacity-50 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[110px]">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
              Total Saldo Token Anda
            </p>
            <div className="flex items-baseline mt-4">
              <span className="text-6xl font-extrabold text-[#0B2A4A] tracking-tighter">
                {total}
              </span>
              <span className="text-sm font-extrabold text-slate-400 ml-2.5 uppercase tracking-wider">
                Token Tersedia
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Card with 1-Active-Case Lock check */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] p-8 flex flex-col justify-center gap-2">
          <Link
            href="/consultations/new"
            className={`text-center text-xs font-bold rounded-full py-4.5 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 ${
              total > 0 && !hasActiveCase
                ? "bg-[#DC0017] hover:bg-red-700 text-white shadow-lg shadow-red-100 cursor-pointer"
                : "bg-slate-200 text-slate-400 pointer-events-none cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="tracking-wider uppercase">BUAT KONSULTASI</span>
          </Link>
          {hasActiveCase && (
            <p className="text-[10px] text-[#DC0017] font-bold text-center mt-1 uppercase tracking-wider">
              Selesaikan konsultasi aktif Anda terlebih dahulu.
            </p>
          )}
        </div>
      </div>

      {/* Konsultasi Berjalan (Active / Waiting cases list for User) */}
      {hasActiveCase && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] p-8 space-y-4">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Konsultasi Berjalan / Menunggu
          </p>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
            {activeCases.map((c) => (
              <a
                key={c.id}
                href={`/consultations/${c.id}`}
                className="group flex items-center justify-between p-5 hover:bg-white transition-all duration-300 first:rounded-t-2xl last:rounded-b-2xl border-b last:border-0 border-slate-100"
              >
                <div className="min-w-0 pr-4">
                  <h4 className="font-bold text-sm text-[#0B2A4A] group-hover:text-[#DC0017] transition-colors truncate">
                    {c.topik}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Dibuat: {new Date(c.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded border uppercase tracking-wider ${
                    c.status === "active" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    {c.status === "active" ? "Aktif" : "Menunggu"}
                  </span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-[#0B2A4A] transition-colors transform group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Token batch details block */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] p-8">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">
          Rincian Batch Token Aktif
        </p>
        
        {batches.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tidak ada batch token aktif.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {batches.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  {/* Subtle Badge */}
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider ${SOURCE_COLORS[b.source_type] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
                    {SOURCE_LABEL[b.source_type]}
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">
                      Kedaluwarsa: <span className="text-[#0B2A4A]">{new Date(b.expiry_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-[#0B2A4A]">{b.sisa_token} token</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
