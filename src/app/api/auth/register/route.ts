import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, no_whatsapp, password } = body;

    // 1. Cek apakah ada data yang kosong
    if (!nama || !email || !no_whatsapp || !password) {
      return NextResponse.json({ error: 'Semua kolom wajib diisi!' }, { status: 400 });
    }

    // 2. Cek apakah email sudah pernah terdaftar
    const [existingUsers]: any = await pool.query(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar!' }, { status: 400 });
    }

    // 3. Acak Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan ke Database (Tabel Users)
    const [result] = await pool.query(
      'INSERT INTO users (nama_perusahaan, email, no_whatsapp, password, role) VALUES (?, ?, ?, ?, ?)',
      [nama, email, no_whatsapp, hashedPassword, 'user']
    );

    return NextResponse.json({ 
      status: 'success', 
      message: 'Registrasi berhasil! Silakan login.' 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}