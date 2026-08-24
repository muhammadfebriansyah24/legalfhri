export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-slate-400">
      <div className="w-8 h-8 border-2 border-[#DC0017] border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-bold uppercase tracking-wider">Memuat halaman...</p>
    </div>
  );
}
