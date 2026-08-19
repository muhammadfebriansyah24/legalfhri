import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Hanya Superadmin yang bisa mengubah paket & harga.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const allowed = ['nama_paket', 'jumlah_token', 'harga', 'masa_berlaku_hari', 'status_aktif', 'urutan_tampil'];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));

  if (fields.length === 0) {
    return NextResponse.json({ error: 'Tidak ada data untuk diubah.' }, { status: 400 });
  }

  // Batch yang sudah dibuat dari paket ini bersifat snapshot permanen (PRD §5.1) —
  // update di sini hanya mengubah baris token_packages, tidak menyentuh token_batches.
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => body[f]);
  await pool.query(`UPDATE token_packages SET ${setClause} WHERE id = ?`, [...values, id]);

  return NextResponse.json({ status: 'success' });
}
