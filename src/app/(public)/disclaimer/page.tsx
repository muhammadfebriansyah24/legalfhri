import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Legal Disclaimer — FHRI Legal Advisory" };

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background Ambience Dots & Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,0,23,0.06),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#EFF6FF] blur-[120px] opacity-60 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl animate-scale-up">
        {/* Double-Bezel wrapping */}
        <div className="bg-slate-900/5 p-1.5 rounded-[2rem] border border-black/5 shadow-2xl">
          <div className="bg-white rounded-[calc(2rem-0.375rem)] p-8 md:p-10 border border-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            
            <div className="mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] block mb-2">
                Legal Disclaimer
              </span>
              <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mb-2">
                Syarat & Ketentuan Konsultasi
              </h1>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                Harap baca dengan seksama sebelum melakukan pendaftaran layanan penasihat hukum kami.
              </p>
            </div>

            {/* Custom styled scroll area with thin scrollbar */}
            <div className="max-h-72 overflow-y-auto bg-[#EFF6FF]/70 rounded-2xl p-6 text-xs text-[#0B2A4A]/90 font-medium space-y-4 border border-slate-100 leading-relaxed scrollbar-thin scrollbar-thumb-slate-200">
              <p>
                Layanan FHRI Legal Advisory (&ldquo;Layanan&rdquo;) adalah kanal konsultasi hukum awal (preliminary)
                antara klien korporat dan tim Admin Legal First HR Indonesia (FHRI), disediakan berbasis token.
              </p>
              <p>
                Informasi yang diberikan melalui Layanan bersifat gambaran umum dan tidak menggantikan pendapat
                hukum formal (legal opinion) atau representasi hukum resmi. Setiap keputusan bisnis yang diambil
                berdasarkan hasil konsultasi menjadi tanggung jawab penuh pengguna.
              </p>
              <p>
                Seluruh transaksi pembayaran (top-up token) dilakukan secara manual di luar sistem website, melalui
                tim Digital Marketing FHRI via WhatsApp. Website tidak memproses atau menyimpan data pembayaran apa pun.
              </p>
              <p>
                Token konsultasi memiliki masa berlaku (expiry) masing-masing sesuai paket yang dibeli atau masa
                free trial. Token yang telah kedaluwarsa tidak dapat dipulihkan atau ditukar kembali.
              </p>
              <p>
                Dokumen yang diunggah dalam sesi konsultasi disimpan secara privat dan hanya dapat diakses oleh
                pemilik konsultasi dan tim Admin Legal/Superadmin FHRI yang berwenang.
              </p>
              <p>
                Dengan mendaftar dan menggunakan Layanan ini, pengguna menyatakan telah membaca, memahami, dan
                menyetujui seluruh ketentuan di atas.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link 
                href="/register" 
                className="inline-block bg-[#DC0017] hover:bg-red-700 text-white text-xs font-bold rounded-full px-8 py-4 transition-all duration-300 active:scale-98 cursor-pointer shadow-lg shadow-red-100 tracking-wider"
              >
                KEMBALI KE PENDAFTARAN
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
