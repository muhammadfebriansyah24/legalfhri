import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { encodeSession, sessionCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Cek apakah ada data yang kosong
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi!' }, { status: 400 });
    }

    // 2. Cari user di database berdasarkan email
    const [users] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Email tidak terdaftar!' }, { status: 401 });
    }

    const user = users[0];

    // 3. Cocokkan password yang diketik dengan password acak di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password salah!' }, { status: 401 });
    }

    // 4. Jika berhasil, siapkan respon sukses
    const response = NextResponse.json({ 
      status: 'success', 
      message: 'Login berhasil!',
      role: user.role 
    }, { status: 200 });

    // 5. Buat Sesi (Cookie, ditandatangani HMAC) agar user tetap login selama 24 jam
    const value = await encodeSession({ id: user.id, role: user.role, nama: user.nama_perusahaan });
    response.cookies.set({ ...sessionCookieOptions(), value });

    return response;

  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}