"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/components/ToastProvider";

type Package = {
  id: number;
  nama_paket: string;
  jumlah_token: number;
  harga: string;
  masa_berlaku_hari: number;
  status_aktif: number;
  urutan_tampil: number;
};

const empty = { nama_paket: "", jumlah_token: "", harga: "", masa_berlaku_hari: "", urutan_tampil: "0" };

export default function PackagesPage() {
  const { showToast, showConfirm } = useUi();
  const [packages, setPackages] = useState<Package[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const load = () => fetch("/api/admin/packages").then((r) => r.json()).then(setPackages);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_paket.trim()) return showToast("error", "Nama paket wajib diisi.");
    if (Number(form.jumlah_token) <= 0) return showToast("error", "Jumlah token harus lebih dari 0.");
    if (Number(form.harga) < 0) return showToast("error", "Harga tidak boleh negatif.");
    if (Number(form.masa_berlaku_hari) <= 0) return showToast("error", "Masa berlaku harus lebih dari 0 hari.");

    const ok = await showConfirm({
      title: "Tambah Paket Token Baru",
      message: `Apakah Anda yakin ingin menambahkan paket baru "${form.nama_paket}"?`,
      confirmLabel: "Simpan Paket",
      cancelLabel: "Batal",
    });

    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jumlah_token: Number(form.jumlah_token),
          harga: Number(form.harga),
          masa_berlaku_hari: Number(form.masa_berlaku_hari),
          urutan_tampil: Number(form.urutan_tampil),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal membuat paket baru.");
      } else {
        showToast("success", "Paket baru berhasil disimpan!");
        setForm(empty); 
        load();
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (p: Package) => {
    const isCurrentlyActive = !!p.status_aktif;
    const ok = await showConfirm({
      title: isCurrentlyActive ? "Nonaktifkan Paket" : "Aktifkan Paket",
      message: `Apakah Anda yakin ingin ${isCurrentlyActive ? "menonaktifkan" : "mengaktifkan"} paket "${p.nama_paket}"? Paket ${isCurrentlyActive ? "tidak akan" : "akan"} tampil di list pembelian.`,
      confirmLabel: isCurrentlyActive ? "Nonaktifkan" : "Aktifkan",
      cancelLabel: "Batal",
      isDanger: isCurrentlyActive,
    });

    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/packages/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_aktif: p.status_aktif ? 0 : 1 }),
      });
      if (res.ok) {
        showToast("success", `Paket "${p.nama_paket}" berhasil ${isCurrentlyActive ? "dinonaktifkan" : "diaktifkan"}.`);
        load();
      } else {
        showToast("error", "Gagal memperbarui status paket.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC0017] leading-none">
          Superadmin Portal
        </span>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mt-1">
          Kelola Paket Token
        </h1>
      </div>

      {/* Package List Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_-10px_rgba(11,42,74,0.06)] divide-y divide-slate-100 overflow-hidden">
        {packages.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-6 hover:bg-slate-50/20 transition-colors">
            <div>
              <p className="font-bold text-sm text-[#0B2A4A]">{p.nama_paket}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {p.jumlah_token} Token · Rp {Number(p.harga).toLocaleString("id-ID")} · {p.masa_berlaku_hari} Hari · Urutan: {p.urutan_tampil}
              </p>
            </div>
            <button
              onClick={() => toggleActive(p)}
              className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95 ${
                p.status_aktif 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                  : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
              }`}
            >
              {p.status_aktif ? "Aktif" : "Nonaktif"}
            </button>
          </div>
        ))}
        {packages.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Belum ada paket terdaftar.</p>
          </div>
        )}
      </div>

      {/* Form Card wrapper */}
      <div>
        <div className="flex items-center mb-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
            Tambah Paket Baru
          </span>
        </div>

        <div className="bg-slate-900/5 p-1 rounded-3xl border border-black/5 shadow-xl">
          <form onSubmit={handleCreate} className="bg-white rounded-[calc(1.5rem-0.25rem)] p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="nama_paket" className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">Nama Paket</label>
              <input 
                id="nama_paket"
                required 
                value={form.nama_paket} 
                onChange={(e) => setForm({ ...form, nama_paket: e.target.value })} 
                placeholder="Contoh: Paket Advisory Starter"
                className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
              />
            </div>
            <div>
              <label htmlFor="jumlah_token" className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">Jumlah Token</label>
              <input 
                id="jumlah_token"
                required 
                type="number" 
                min={1} 
                value={form.jumlah_token} 
                onChange={(e) => setForm({ ...form, jumlah_token: e.target.value })} 
                placeholder="5"
                className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
              />
            </div>
            <div>
              <label htmlFor="harga" className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">Harga (Rp)</label>
              <input 
                id="harga"
                required 
                type="number" 
                min={0} 
                value={form.harga} 
                onChange={(e) => setForm({ ...form, harga: e.target.value })} 
                placeholder="500000"
                className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
              />
            </div>
            <div>
              <label htmlFor="masa_berlaku_hari" className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">Masa Berlaku (hari)</label>
              <input 
                id="masa_berlaku_hari"
                required 
                type="number" 
                min={1} 
                value={form.masa_berlaku_hari} 
                onChange={(e) => setForm({ ...form, masa_berlaku_hari: e.target.value })} 
                placeholder="30"
                className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
              />
            </div>
            <div>
              <label htmlFor="urutan_tampil" className="block text-[10px] font-extrabold text-[#0B2A4A] mb-2 uppercase tracking-wider">Urutan Tampil</label>
              <input 
                id="urutan_tampil"
                type="number" 
                value={form.urutan_tampil} 
                onChange={(e) => setForm({ ...form, urutan_tampil: e.target.value })} 
                placeholder="1"
                className="w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-sm text-[#0B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#DC0017]/30 border border-transparent focus:border-transparent transition-all duration-300" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="md:col-span-2 bg-[#DC0017] hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full py-4.5 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-lg shadow-red-100 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="tracking-wider uppercase">Menyimpan...</span>
                </>
              ) : (
                <span className="tracking-wider uppercase">TAMBAH PAKET BARU</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
