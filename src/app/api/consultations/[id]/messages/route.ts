import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getSession } from '@/lib/session';
import { saveUploadedFile, UploadError } from '@/lib/upload';

async function loadConsultation(id: string) {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM consultations WHERE id = ?', [id]);
  return rows[0] ?? null;
}

function canAccess(session: { id: number; role: string }, consultation: RowDataPacket) {
  if (session.role === 'user') return consultation.user_id === session.id;
  if (session.role === 'admin_legal') return true; // queue + assigned cases
  return session.role === 'superadmin';
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const { id } = await params;
  const consultation = await loadConsultation(id);
  if (!consultation) return NextResponse.json({ error: 'Konsultasi tidak ditemukan.' }, { status: 404 });
  if (!canAccess(session, consultation)) return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const after = Number(searchParams.get('after') || 0);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT m.*, u.nama_perusahaan, u.role AS sender_role
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.consultation_id = ? AND m.id > ?
     ORDER BY m.id ASC`,
    [id, after]
  );

  return NextResponse.json(rows);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const { id } = await params;
  const consultation = await loadConsultation(id);
  if (!consultation) return NextResponse.json({ error: 'Konsultasi tidak ditemukan.' }, { status: 404 });
  if (!canAccess(session, consultation)) return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });
  if (consultation.status === 'closed') {
    return NextResponse.json({ error: 'Kasus sudah ditutup, tidak bisa mengirim pesan baru.' }, { status: 400 });
  }

  const form = await request.formData();
  const pesan = String(form.get('pesan') || '').trim();
  const file = form.get('berkas') as File | null;

  if (!pesan && (!file || file.size === 0)) {
    return NextResponse.json({ error: 'Pesan atau berkas wajib diisi.' }, { status: 400 });
  }

  let fileUrl: string | null = null;
  try {
    if (file && file.size > 0) fileUrl = await saveUploadedFile(file, session.id);
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO messages (consultation_id, sender_id, pesan, file_url, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [id, session.id, pesan, fileUrl]
  );

  // Admin Legal membalas tiket 'waiting' -> otomatis jadi 'active' & ter-assign ke admin ini.
  if (session.role === 'admin_legal' && consultation.status === 'waiting') {
    await pool.query(`UPDATE consultations SET status = 'active', admin_id = ? WHERE id = ?`, [session.id, id]);
  }

  return NextResponse.json({ status: 'success', id: result.insertId }, { status: 201 });
}
