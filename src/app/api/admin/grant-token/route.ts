import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { getSession } from '@/lib/session';
import { grantToken } from '@/lib/tokenGrant';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'digital_marketing' && session.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });
  }

  const body = await request.json();
  const { userId, packageId, jumlahToken, masaBerlakuHari, catatan } = body;

  if (!userId) {
    return NextResponse.json({ error: 'User wajib dipilih.' }, { status: 400 });
  }

  if (packageId) {
    // Jalur paket (§6.1): ambil angka dari token_packages, bukan dari input client.
    const [pkgs] = await pool.query<RowDataPacket[]>(
      'SELECT jumlah_token, masa_berlaku_hari FROM token_packages WHERE id = ? AND status_aktif = 1',
      [packageId]
    );
    if (pkgs.length === 0) {
      return NextResponse.json({ error: 'Paket tidak ditemukan atau sudah nonaktif.' }, { status: 400 });
    }
    await grantToken({
      userId,
      sourceType: 'package',
      packageId,
      jumlahToken: pkgs[0].jumlah_token,
      masaBerlakuHari: pkgs[0].masa_berlaku_hari,
      grantedBy: session.id,
      catatan: catatan || null,
    });
  } else {
    // Jalur manual (§6.2): wajib catatan.
    if (!catatan || !catatan.trim()) {
      return NextResponse.json({ error: 'Catatan/alasan wajib diisi untuk Grant Manual.' }, { status: 400 });
    }
    if (!jumlahToken || !masaBerlakuHari) {
      return NextResponse.json({ error: 'Jumlah token dan masa berlaku wajib diisi.' }, { status: 400 });
    }
    await grantToken({
      userId,
      sourceType: 'manual',
      packageId: null,
      jumlahToken: Number(jumlahToken),
      masaBerlakuHari: Number(masaBerlakuHari),
      grantedBy: session.id,
      catatan,
    });
  }

  return NextResponse.json({ status: 'success' }, { status: 201 });
}
