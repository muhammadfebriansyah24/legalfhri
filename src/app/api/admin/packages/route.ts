import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'digital_marketing' && session.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM token_packages ORDER BY urutan_tampil ASC, id ASC'
  );
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Hanya Superadmin yang bisa mengubah paket & harga.' }, { status: 403 });
  }

  const body = await request.json();
  const { nama_paket, jumlah_token, harga, masa_berlaku_hari, urutan_tampil } = body;

  if (!nama_paket || !jumlah_token || !harga || !masa_berlaku_hari) {
    return NextResponse.json({ error: 'Semua kolom wajib diisi.' }, { status: 400 });
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO token_packages (nama_paket, jumlah_token, harga, masa_berlaku_hari, status_aktif, urutan_tampil)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [nama_paket, jumlah_token, harga, masa_berlaku_hari, urutan_tampil ?? 0]
  );

  return NextResponse.json({ status: 'success', id: result.insertId }, { status: 201 });
}
