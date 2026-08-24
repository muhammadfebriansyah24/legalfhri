import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { getSession } from '@/lib/session';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const { id } = await params;
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.*, u.nama_perusahaan, u.no_whatsapp
     FROM consultations c JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
    [id]
  );

  if (rows.length === 0) return NextResponse.json({ error: 'Konsultasi tidak ditemukan.' }, { status: 404 });
  const consultation = rows[0];

  const isOwner = session.role === 'user' && consultation.user_id === session.id;
  const isAdmin = session.role === 'admin_legal' || session.role === 'superadmin';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });
  }

  return NextResponse.json(consultation);
}
