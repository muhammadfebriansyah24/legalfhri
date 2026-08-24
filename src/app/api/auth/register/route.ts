import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { grantToken } from '@/lib/tokenGrant';

const FREE_TRIAL_TOKENS = 2;
const FREE_TRIAL_DAYS = 14;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, no_whatsapp, password } = body;

    // 1. Cek apakah ada data yang kosong
    if (!nama || !email || !no_whatsapp || !password) {
      return NextResponse.json({ error: 'Semua kolom wajib diisi!' }, { status: 400 });
    }

    // 1b. Password minimum 8 karakter
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter!' }, { status: 400 });
    }

    // 2. Anti-abuse free trial (PRD §7.5): email ATAU no. WhatsApp yang sudah pernah
    // dipakai tidak boleh dipakai lagi, agar 1 perusahaan tidak klaim ulang token gratis.
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? OR no_whatsapp = ?',
      [email, no_whatsapp]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email atau nomor WhatsApp sudah pernah terdaftar!' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan user + buat batch Free Trial pertama dalam satu transaksi (PRD §4, §6.3)
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query<ResultSetHeader>(
        'INSERT INTO users (nama_perusahaan, email, no_whatsapp, password, role) VALUES (?, ?, ?, ?, ?)',
        [nama, email, no_whatsapp, hashedPassword, 'user']
      );
      const userId = result.insertId;

      await grantToken(
        {
          userId,
          sourceType: 'free_trial',
          packageId: null,
          jumlahToken: FREE_TRIAL_TOKENS,
          masaBerlakuHari: FREE_TRIAL_DAYS,
          grantedBy: null,
        },
        conn
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    return NextResponse.json({
      status: 'success',
      message: 'Registrasi berhasil! Anda mendapat 2 token konsultasi gratis. Silakan login.',
    }, { status: 201 });

  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
