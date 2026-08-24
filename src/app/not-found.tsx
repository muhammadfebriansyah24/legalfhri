import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <p className="text-6xl font-extrabold text-[#0B2A4A] tracking-tighter">404</p>
        <h2 className="text-lg font-extrabold text-[#0B2A4A] tracking-tight">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 font-medium">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        <Link
          href="/login"
          className="inline-block bg-[#DC0017] hover:bg-red-700 text-white text-xs font-bold rounded-full px-6 py-3 transition-all duration-300 active:scale-98 cursor-pointer shadow-lg shadow-red-100"
        >
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
