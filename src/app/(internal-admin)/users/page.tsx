"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/components/ToastProvider";

type User = {
  id: number;
  nama_perusahaan: string;
  email: string;
  no_whatsapp: string;
  role: "user" | "admin_legal" | "digital_marketing" | "superadmin";
  created_at: string;
};

const ROLE_LABEL: Record<string, string> = {
  user: "User / Klien",
  admin_legal: "Admin Legal",
  digital_marketing: "Digital Marketing",
  superadmin: "Superadmin",
};

export default function UsersPage() {
  const { showToast, showConfirm } = useUi();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async (search = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Handle instant search on Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(query);
  };

  const handleRoleChange = async (u: User, newRole: string) => {
    if (u.role === newRole) return;

    const ok = await showConfirm({
      title: "Ubah Role Pengguna",
      message: `Apakah Anda yakin ingin mengubah role ${u.nama_perusahaan} (${u.email}) dari "${ROLE_LABEL[u.role]}" menjadi "${ROLE_LABEL[newRole]}"?`,
      confirmLabel: "Ubah Role",
      cancelLabel: "Batal",
      isDanger: newRole === "superadmin" || u.role === "superadmin",
    });

    if (!ok) {
      // Re-fetch users to reset select value
      fetchUsers(query);
      return;
    }

    setUpdatingId(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Gagal mengubah role.");
      } else {
        showToast("success", `Role ${u.nama_perusahaan} berhasil diubah ke ${ROLE_LABEL[newRole]}.`);
        setUsers((prev) =>
          prev.map((user) => (user.id === u.id ? { ...user, role: newRole as any } : user))
        );
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
          Superadmin Portal
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Kelola Pengguna
        </h1>
      </div>

      {/* Search Bar Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama, email, atau nomor WhatsApp..."
          className="flex-1 bg-white border border-slate-200 rounded-full px-5 py-3 text-sm text-[#0B2A4A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 focus:border-transparent transition-all duration-300 shadow-sm"
        />
        <button
          type="submit"
          className="bg-[#0B2A4A] hover:bg-slate-800 text-white font-bold text-xs rounded-full px-6 py-3.5 transition-all duration-300 shadow-md shadow-slate-100 uppercase tracking-wider"
        >
          Cari
        </button>
      </form>

      {/* Users List Table with premium design */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#DC0017] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold uppercase tracking-wider">Memuat daftar pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tidak ada pengguna ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pengguna</th>
                  <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kontak</th>
                  <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Role Sekarang</th>
                  <th className="p-4.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ubah Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4.5">
                      <p className="font-bold text-[#0B2A4A] text-sm">{u.nama_perusahaan}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Terdaftar: {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="p-4.5">
                      <p className="font-bold text-[#0B2A4A]">{u.email}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{u.no_whatsapp}</p>
                    </td>
                    <td className="p-4.5">
                      <span
                        className={`inline-block text-[9px] font-extrabold px-2.5 py-1 rounded border uppercase tracking-wider ${
                          u.role === "superadmin"
                            ? "bg-red-55 text-red-700 border-red-150"
                            : u.role === "admin_legal"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : u.role === "digital_marketing"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="p-4.5">
                      <select
                        disabled={updatingId === u.id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="bg-[#EFF6FF] rounded-xl px-3 py-2 text-[11px] text-[#0B2A4A] font-bold focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300 disabled:opacity-50"
                      >
                        <option value="user">User / Klien</option>
                        <option value="admin_legal">Admin Legal</option>
                        <option value="digital_marketing">Digital Marketing</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
