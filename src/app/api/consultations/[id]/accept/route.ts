import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getSession } from '@/lib/session';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin_legal') {
    return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });
  }

  const { id } = await params;
  const [rows] = await pool.query<RowDataPacket[]>('SELECT status FROM consultations WHERE id = ?', [id]);
  if (rows.length === 0) return NextResponse.json({ error: 'Konsultasi tidak ditemukan.' }, { status: 404 });
  if (rows[0].status !== 'waiting') {
    return NextResponse.json({ error: 'Tiket ini sudah diambil admin lain.' }, { status: 409 });
  }

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE consultations SET status = 'active', admin_id = ? WHERE id = ? AND status = 'waiting'`,
    [session.id, id]
  );
  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Tiket ini sudah diambil admin lain.' }, { status: 409 });
  }

  return NextResponse.json({ status: 'success' });
}
