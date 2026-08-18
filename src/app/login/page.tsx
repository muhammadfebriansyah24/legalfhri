export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100">
        
        {/* Bagian Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#DC0017] mb-2">
            FHRI ADMIN
          </p>
          <h1 className="text-3xl font-extrabold text-[#0B2A4A] mb-2">
            Login Portal
          </h1>
          <p className="text-slate-500 text-sm">
            Silakan masuk menggunakan kredensial admin Anda.
          </p>
        </div>

        {/* Form Login */}
        <form className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#0B2A4A] mb-2 uppercase">
              Email
            </label>
            <input 
              type="email" 
              placeholder="fiqlacampus24@gmail.com" 
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B2A4A] mb-2 uppercase">
              Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/50 transition-all"
            />
          </div>

          <button 
            type="button" 
            className="w-full mt-4 bg-[#DC0017] hover:bg-red-700 text-white font-bold rounded-full px-6 py-4 transition-colors flex items-center justify-center gap-2"
          >
            LOGIN DASHBOARD
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>

        {/* Link Daftar */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Belum memiliki akun? <a href="#" className="font-bold text-[#DC0017] hover:underline">Daftar Di Sini</a>
          </p>
        </div>

      </div>
    </div>
  );
}