"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useUi } from "@/components/ToastProvider";

type Message = {
  id: number;
  sender_id: number;
  pesan: string;
  file_url: string | null;
  created_at: string;
  nama_perusahaan: string;
  sender_role: string;
};

type Consultation = {
  id: number;
  topik: string;
  deskripsi_awal: string;
  status: "waiting" | "active" | "closed";
  nama_perusahaan: string;
  admin_id: number | null;
};

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
});

const STATUS_LABEL: Record<string, string> = { waiting: "Menunggu", active: "Aktif", closed: "Selesai" };
const STATUS_STYLE: Record<string, string> = {
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-250",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function ChatRoom({
  consultationId,
  myUserId,
  isAdmin,
  onClosed,
}: {
  consultationId: number;
  myUserId: number;
  isAdmin: boolean;
  onClosed?: () => void;
}) {
  const { showToast, showConfirm } = useUi();
  const { data: consultation, mutate: mutateConsultation } = useSWR<Consultation>(
    `/api/consultations/${consultationId}`,
    fetcher
  );
  
  const { data: messages } = useSWR<Message[]>(
    consultation
      ? `/api/consultations/${consultationId}/messages`
      : null,
    fetcher,
    { refreshInterval: consultation?.status === "closed" ? 0 : 4000 }
  );

  const [pesan, setPesan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [isOutsideHours, setIsOutsideHours] = useState(false);
  const [workingHoursText, setWorkingHoursText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((settings) => {
        if (!settings.jam_kerja_mulai || !settings.jam_kerja_selesai) return;
        setWorkingHoursText(`${settings.jam_kerja_hari || "Senin-Jumat"}, ${settings.jam_kerja_mulai} - ${settings.jam_kerja_selesai}`);
        
        const now = new Date();
        const day = now.getDay();
        const isWeekend = day === 0 || day === 6;
        
        const [startH, startM] = settings.jam_kerja_mulai.split(":").map(Number);
        const [endH, endM] = settings.jam_kerja_selesai.split(":").map(Number);
        
        const currentH = now.getHours();
        const currentM = now.getMinutes();
        
        const currentMinutes = currentH * 60 + currentM;
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        const isOutside = currentMinutes < startMinutes || currentMinutes > endMinutes;
        setIsOutsideHours(isWeekend || isOutside);
      })
      .catch((err) => { console.error('Failed to load settings:', err); });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim() && !file) return;
    setSending(true);
    try {
      const form = new FormData();
      form.set("pesan", pesan);
      if (file) form.set("berkas", file);
      const res = await fetch(`/api/consultations/${consultationId}/messages`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal mengirim pesan.");
      } else {
        setPesan("");
        setFile(null);
        mutateConsultation();
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (force: boolean) => {
    const ok = await showConfirm({
      title: force ? "Force Close Kasus" : "Selesaikan Sesi Konsultasi",
      message: force 
        ? "Apakah Anda yakin ingin melakukan Force Close pada kasus ini? Token klien akan tetap terpotong."
        : "Apakah Anda yakin ingin menyelesaikan sesi konsultasi ini? 1 token klien akan terpotong sebagai biaya advisory.",
      confirmLabel: force ? "Force Close" : "Ya, Selesaikan",
      cancelLabel: "Batal",
      isDanger: true
    });
    
    if (!ok) return;
    
    setClosing(true);
    try {
      const res = await fetch(`/api/consultations/${consultationId}/${force ? "force-close" : "close"}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal menutup kasus.");
      } else {
        showToast("success", force ? "Kasus di-force close." : "Sesi konsultasi diselesaikan.");
        mutateConsultation();
        onClosed?.();
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setClosing(false);
    }
  };

  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400">
        <div className="w-8 h-8 border-2 border-[#DC0017] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold uppercase tracking-wider">Memuat ruang konsultasi...</p>
      </div>
    );
  }

  const isClosed = consultation.status === "closed";

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] bg-white rounded-3xl border border-slate-100 m-4 overflow-hidden shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)]">
      
      {/* Header Room */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 shrink-0 bg-white z-10">
        <div className="min-w-0">
          <h3 className="font-extrabold text-[#0B2A4A] tracking-tight truncate leading-tight">
            {consultation.topik}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            Klien: {consultation.nama_perusahaan}
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${STATUS_STYLE[consultation.status]}`}>
            {STATUS_LABEL[consultation.status]}
          </span>
          {isAdmin && !isClosed && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleClose(false)}
                disabled={closing}
                className="bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full px-5 py-2.5 transition-all duration-300 active:scale-98 cursor-pointer shadow-md shadow-red-50"
              >
                Selesaikan
              </button>
              <button
                onClick={() => handleClose(true)}
                disabled={closing}
                className="text-xs font-bold text-slate-400 hover:text-[#DC0017] px-3.5 py-2.5 rounded-full hover:bg-slate-50 transition-all duration-300 cursor-pointer"
              >
                Force Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Outside Hours Alarm Alert */}
      {isOutsideHours && !isClosed && (
        <div className="bg-amber-50/90 backdrop-blur-sm border-b border-amber-200/50 px-6 py-3 text-xs text-amber-800 font-semibold flex items-center gap-2.5 shrink-0 animate-slide-in">
          <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-tight">
            Saat ini di luar jam kerja ({workingHoursText || "Senin-Jumat, 09:00 - 17:00"}). Tanggapan dari tim legal mungkin mengalami keterlambatan.
          </span>
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F8FAFC]">
        
        {/* Initial Description Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_-6px_rgba(11,42,74,0.04)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-3 rounded bg-[#DC0017]"></div>
            <p className="font-extrabold text-[#0B2A4A] text-[10px] uppercase tracking-widest">
              Deskripsi Awal Permasalahan
            </p>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
            {consultation.deskripsi_awal}
          </p>
        </div>

        {/* Message Thread */}
        {messages?.map((m) => {
          const mine = m.sender_id === myUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} animate-scale-up`}>
              <div
                className={`max-w-[70%] px-4.5 py-3 rounded-2xl shadow-[0_2px_8px_-4px_rgba(11,42,74,0.04)] ${
                  mine
                    ? "bg-[#0B2A4A] text-white rounded-br-sm"
                    : "bg-white border border-slate-100 text-[#0B2A4A] rounded-bl-sm"
                }`}
              >
                {!mine && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[#0B2A4A]">
                      {m.sender_role === "admin_legal" || m.sender_role === "superadmin" ? "Legal Advisory" : m.nama_perusahaan}
                    </span>
                  </div>
                )}
                {m.pesan && <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{m.pesan}</p>}
                
                {/* File Attachment Box */}
                {m.file_url && (
                  <div className="mt-2.5">
                    <a
                      href={`/api/files/${m.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold border transition-colors ${
                        mine 
                          ? "bg-white/10 hover:bg-white/20 border-white/10 text-white" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-[#DC0017]"
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Unduh Berkas Pendukung</span>
                    </a>
                  </div>
                )}
                
                <p className={`text-[8px] font-extrabold uppercase tracking-wide mt-1.5 text-right ${mine ? "text-white/60" : "text-slate-400"}`}>
                  {new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Message Input Footer Form */}
      {!isClosed ? (
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            
            {/* Attachment Button */}
            <label 
              className={`cursor-pointer w-11 h-11 rounded-full flex items-center justify-center shrink-0 border border-slate-100 hover:bg-slate-50 transition-all duration-300 ${
                file ? "bg-[#EFF6FF] text-[#0B2A4A] border-[#EFF6FF]" : "text-slate-400 hover:text-[#0B2A4A]"
              }`}
              title="Lampirkan berkas (PDF/JPG/PNG, maks 5MB)"
              aria-label="Lampirkan berkas"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            
            {file && (
              <div className="flex items-center gap-1.5 bg-[#EFF6FF] border border-blue-100 rounded-full py-1.5 px-3 max-w-[150px] shrink-0">
                <span className="text-[10px] text-[#0B2A4A] font-bold truncate">{file.name}</span>
                <button 
                  type="button" 
                  onClick={() => setFile(null)} 
                  aria-label="Hapus berkas"
                  className="text-slate-400 hover:text-[#DC0017] font-bold text-xs"
                >
                  ×
                </button>
              </div>
            )}

            <input
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Ketik pesan konsultasi Anda..."
              className="flex-1 bg-[#EFF6FF] rounded-full px-5 py-3 text-sm text-[#0B2A4A] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300"
            />
            
            <button
              type="submit"
              disabled={sending || (!pesan.trim() && !file)}
              aria-label="Kirim pesan"
              className="bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-full w-11 h-11 flex items-center justify-center shrink-0 shadow-lg shadow-red-100 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-100 text-center text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 bg-slate-50">
          Kasus ini sudah diselesaikan — ruang chat bersifat baca saja.
        </div>
      )}
    </div>
  );
}
