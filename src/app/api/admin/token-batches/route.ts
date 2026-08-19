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

  let sql = `SELECT tb.*, u.nama_perusahaan, u.email, gu.nama_perusahaan AS granted_by_name
             FROM token_batches tb
             JOIN users u ON u.id = tb.user_id
             LEFT JOIN users gu ON gu.id = tb.granted_by`;
  const params: unknown[] = [];
  if (q) {
    sql += ' WHERE u.email LIKE ? OR u.nama_perusahaan LIKE ?';
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY tb.created_at DESC LIMIT 200';

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return NextResponse.json(rows);
}
