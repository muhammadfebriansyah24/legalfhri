import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getSession } from '@/lib/session';
import { getTotalBalance } from '@/lib/tokenBalance';
import { saveUploadedFile, UploadError } from '@/lib/upload';
import { runAutoClose } from '@/lib/autoClose';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  // Trigger background auto-close check
  runAutoClose().catch(() => {});

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // 'waiting' | 'active' | 'closed'

  let sql = `SELECT c.*, u.nama_perusahaan
             FROM consultations c JOIN users u ON u.id = c.user_id WHERE `;
  const params: unknown[] = [];

  if (session.role === 'user') {
    sql += 'c.user_id = ?';
    params.push(session.id);
  } else if (session.role === 'admin_legal') {
    if (status === 'waiting') {
      sql += "c.status = 'waiting'";
    } else {
      sql += 'c.admin_id = ?';
      params.push(session.id);
    }
  } else {
    return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });
  }

  if (status && status !== 'waiting') {
    sql += ' AND c.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY c.created_at DESC';

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });
  if (session.role !== 'user') return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });

  const saldo = await getTotalBalance(session.id);
  if (saldo <= 0) {
    return NextResponse.json({ error: 'Token Anda sudah habis. Silakan top-up melalui Tim Digital Marketing.' }, { status: 400 });
  }

  // Periksa apakah user masih memiliki konsultasi aktif/waiting
  const [activeRows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM consultations WHERE user_id = ? AND status IN ('waiting', 'active')",
    [session.id]
  );
  if (activeRows.length > 0) {
    return NextResponse.json(
      { error: 'Anda masih memiliki sesi konsultasi yang aktif atau menunggu. Silakan selesaikan sesi tersebut terlebih dahulu sebelum membuat yang baru.' },
      { status: 400 }
    );
  }

  const form = await request.formData();
  const topik = String(form.get('topik') || '').trim();
  const deskripsi = String(form.get('deskripsi_awal') || '').trim();
  const file = form.get('berkas') as File | null;

  if (!topik || !deskripsi) {
    return NextResponse.json({ error: 'Topik dan deskripsi wajib diisi.' }, { status: 400 });
  }

  let fileUrl: string | null = null;
  try {
    if (file && file.size > 0) {
      fileUrl = await saveUploadedFile(file, session.id);
    }
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO consultations (user_id, topik, deskripsi_awal, status, created_at)
     VALUES (?, ?, ?, 'waiting', NOW())`,
    [session.id, topik, deskripsi]
  );
  const consultationId = result.insertId;

  if (fileUrl) {
    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, pesan, file_url, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [consultationId, session.id, `Berkas awal: ${deskripsi}`, fileUrl]
    );
  }

  return NextResponse.json({ status: 'success', id: consultationId }, { status: 201 });
}
