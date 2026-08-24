import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export default async function AdminHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.id, c.topik, c.created_at, u.nama_perusahaan
     FROM consultations c JOIN users u ON u.id = c.user_id
     WHERE c.admin_id = ? AND c.status = 'closed'
     ORDER BY c.created_at DESC`,
    [session.id]
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
          Arsip Kasus
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Riwayat Konsultasi
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Total kasus diselesaikan: {rows.length}
        </p>
      </div>

      {/* Case list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Belum ada kasus yang diselesaikan.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => (
              <a
                key={r.id}
                href={`/case/${r.id}`}
                className="group flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-[#EFF6FF] text-slate-400 group-hover:text-[#0B2A4A] flex items-center justify-center border border-slate-100 transition-colors shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B2A4A] group-hover:text-[#DC0017] transition-colors leading-tight">
                      {r.topik}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Klien: <span className="text-slate-500">{r.nama_perusahaan}</span> · Selesai pada {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider border border-slate-100">
                    Closed / Selesai
                  </span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-[#0B2A4A] transition-colors transform group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
