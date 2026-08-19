import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const [rows] = await pool.query<RowDataPacket[]>('SELECT setting_key, setting_value FROM app_settings');
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.setting_key] = row.setting_value;
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Hanya Superadmin yang bisa mengubah pengaturan.' }, { status: 403 });
  }

  const body = await request.json() as Record<string, string>;
  const entries = Object.entries(body);
  if (entries.length === 0) return NextResponse.json({ error: 'Tidak ada data.' }, { status: 400 });

  for (const [key, value] of entries) {
    await pool.query(
      `INSERT INTO app_settings (setting_key, setting_value, updated_at) VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
      [key, value]
    );
  }

  return NextResponse.json({ status: 'success' });
}
