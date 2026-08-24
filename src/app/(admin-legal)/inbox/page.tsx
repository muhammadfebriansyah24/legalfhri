"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUi } from "@/components/ToastProvider";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
});

type Ticket = {
  id: number;
  topik: string;
  nama_perusahaan: string;
  status: string;
  created_at: string;
};

export default function InboxPage() {
  const router = useRouter();
  const { showToast, showConfirm } = useUi();
  const { data: waiting, mutate: mutateWaiting } = useSWR<Ticket[]>("/api/consultations?status=waiting", fetcher, { refreshInterval: 5000 });
  const { data: mine, mutate: mutateMine } = useSWR<Ticket[]>("/api/consultations?status=active", fetcher, { refreshInterval: 5000 });

  const handleAccept = async (id: number, topik: string) => {
    const ok = await showConfirm({
      title: "Terima Kasus Hukum",
      message: `Apakah Anda yakin ingin menangani kasus "${topik}"?`,
      confirmLabel: "Terima Kasus",
      cancelLabel: "Batal",
    });

    if (!ok) return;

    try {
      const res = await fetch(`/api/consultations/${id}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal menerima kasus.");
        mutateWaiting();
      } else {
        showToast("success", "Kasus berhasil diterima!");
        router.push(`/case/${id}`);
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
          Queue Inbox
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Antrean Tiket Konsultasi
        </h1>
      </div>

      {/* Waiting Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
            Menunggu Penanganan ({waiting?.length ?? 0})
          </span>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] divide-y divide-slate-100 overflow-hidden">
          {waiting?.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <svg className="w-8 h-8 text-slate-350 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tidak ada tiket menunggu.</p>
            </div>
          )}
          
          {waiting?.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-6 hover:bg-slate-50/30 transition-colors">
              <div className="min-w-0 pr-4">
                <h4 className="font-bold text-sm text-[#0B2A4A] truncate leading-tight">
                  {t.topik}
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Klien: <span className="text-slate-500">{t.nama_perusahaan}</span> · Masuk: <span className="text-slate-500">{new Date(t.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </p>
              </div>
              <button
                onClick={() => handleAccept(t.id, t.topik)}
                className="bg-[#DC0017] hover:bg-red-700 text-white text-xs font-bold rounded-full px-5 py-2.5 transition-all duration-300 active:scale-98 cursor-pointer shadow-md shadow-red-50 shrink-0"
              >
                Terima Kasus
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
            Kasus Saya yang Aktif ({mine?.length ?? 0})
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] divide-y divide-slate-100 overflow-hidden">
          {mine?.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <svg className="w-8 h-8 text-slate-350 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tidak ada kasus aktif.</p>
            </div>
          )}
          
          {mine?.map((t) => (
            <Link 
              key={t.id} 
              href={`/case/${t.id}`} 
              className="group flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all duration-300"
            >
              <div className="min-w-0 pr-4">
                <h4 className="font-bold text-sm text-[#0B2A4A] group-hover:text-[#DC0017] transition-colors truncate leading-tight">
                  {t.topik}
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Klien: <span className="text-slate-500">{t.nama_perusahaan}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                  Aktif
                </span>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-[#0B2A4A] transition-colors transform group-hover:translate-x-1 duration-350" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
