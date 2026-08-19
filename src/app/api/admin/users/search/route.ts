import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'digital_marketing' && session.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json([]);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, nama_perusahaan, email, no_whatsapp
     FROM users WHERE role = 'user' AND (email LIKE ? OR no_whatsapp LIKE ?)
     LIMIT 10`,
    [`%${q}%`, `%${q}%`]
  );
  return NextResponse.json(rows);
}
