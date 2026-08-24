import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { getSession } from '@/lib/session';
import { STORAGE_DIR } from '@/lib/upload';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const { fileId } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT m.file_url, c.user_id
     FROM messages m JOIN consultations c ON c.id = m.consultation_id
     WHERE m.id = ? AND m.file_url IS NOT NULL`,
    [fileId]
  );
  if (rows.length === 0) return NextResponse.json({ error: 'Berkas tidak ditemukan.' }, { status: 404 });

  const { file_url: fileUrl, user_id: ownerId } = rows[0];
  const isOwner = session.role === 'user' && ownerId === session.id;
  const isAdmin = session.role === 'admin_legal' || session.role === 'superadmin';
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });

  // fileUrl adalah nama file hasil sanitasi (bukan path), aman digabung ke STORAGE_DIR.
  const filePath = path.join(STORAGE_DIR, path.basename(fileUrl));
  try {
    const buffer = await readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Disposition': `attachment; filename="${path.basename(fileUrl)}"`,
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Berkas tidak ditemukan di server.' }, { status: 404 });
  }
}
