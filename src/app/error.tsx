"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#DC0017] mx-auto border border-red-100">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-[#0B2A4A] tracking-tight">Terjadi Kesalahan</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {error.message || "Halaman mengalami kesalahan yang tidak terduga."}
        </p>
        <button
          onClick={reset}
          className="bg-[#DC0017] hover:bg-red-700 text-white text-xs font-bold rounded-full px-6 py-3 transition-all duration-300 active:scale-98 cursor-pointer shadow-lg shadow-red-100"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
