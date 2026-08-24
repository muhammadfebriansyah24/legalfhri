"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export type NavItem = { href: string; label: string };

// Helper to render custom inline SVGs for standard menu paths to avoid adding external dependencies
const getIcon = (href: string) => {
  const baseClass = "w-5 h-5 transition-transform duration-300 group-hover:scale-110";
  if (href === "/dashboard") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    );
  }
  if (href === "/consultations/new") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    );
  }
  if (href === "/consultations/history") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (href === "/history") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (href === "/inbox") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
      </svg>
    );
  }
  if (href === "/grant-token") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (href === "/audit-log") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    );
  }
  if (href === "/users") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }
  if (href === "/packages") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  }
  if (href === "/settings") {
    return (
      <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  return (
    <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
};

export default function AppShell({
  eyebrow,
  navItems,
  userName,
  children,
}: {
  eyebrow: string;
  navItems: NavItem[];
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar with Premium Double Bezel & Shadowing */}
      <aside className="w-66 bg-white border-r border-slate-100 flex flex-col shrink-0 shadow-[4px_0_24px_-12px_rgba(11,42,74,0.06)] relative z-10">
        
        {/* Sidebar Header with Premium Brand Presentation */}
        <div className="p-6 border-b border-slate-100 flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
            {eyebrow}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#DC0017] animate-pulse"></div>
            <h2 className="text-xl font-extrabold text-[#0B2A4A] tracking-tight">
              FHRI Legal
            </h2>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  active
                    ? "bg-[#EFF6FF] border-[#EFF6FF] text-[#0B2A4A] shadow-[0_4px_12px_-4px_rgba(11,42,74,0.08)]"
                    : "border-transparent text-slate-500 hover:text-[#0B2A4A] hover:bg-slate-50/80"
                }`}
              >
                <span className={active ? "text-[#DC0017]" : "text-slate-400 group-hover:text-[#0B2A4A] transition-colors"}>
                  {getIcon(item.href)}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout with tactile response */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_-4px_rgba(11,42,74,0.05)]">
            <div className="flex items-center gap-3 mb-3">
              {/* Squircle Avatar style */}
              <div className="w-9 h-9 rounded-xl bg-[#0B2A4A] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-inner shrink-0">
                {userName ? userName.substring(0, 2).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0B2A4A] truncate leading-tight">
                  {userName || "User Klien"}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  Logged in
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:bg-[#DC0017] border border-slate-100 hover:border-[#DC0017] transition-all duration-300 active:scale-98 cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar Portal</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content container with smooth transition entry */}
      <main className="flex-1 bg-slate-50 min-h-screen overflow-y-auto relative animate-fade-in">
        {children}
      </main>
    </div>
  );
}
