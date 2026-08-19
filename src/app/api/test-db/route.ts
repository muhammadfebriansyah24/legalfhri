import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  // Endpoint debug koneksi DB — dinonaktifkan di production agar tidak bocorkan detail error.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ status: 'not found' }, { status: 404 });
  }
  try {
    // Mencoba menarik data dari tabel token_packages yang tadi kita buat di XAMPP
    const [rows] = await pool.query('SELECT * FROM token_packages');
    
    return NextResponse.json({ 
      status: 'Koneksi Sukses! 🚀', 
      data: rows 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'Koneksi Gagal ❌', 
      error: (error as Error).message 
    }, { status: 500 });
  }
}