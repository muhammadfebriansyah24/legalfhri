import pool from '@/lib/db';
import type { PoolConnection } from 'mysql2/promise';

export type GrantTokenInput = {
  userId: number;
  sourceType: 'free_trial' | 'package' | 'manual';
  packageId: number | null;
  jumlahToken: number;
  masaBerlakuHari: number;
  grantedBy: number | null;
  catatan?: string | null;
};

/**
 * Buat 1 batch baru. Murni INSERT, tidak pernah UPDATE batch lain.
 * conn opsional: dilewatkan saat dipanggil di dalam transaksi lain (mis. registrasi).
 */
export async function grantToken(input: GrantTokenInput, conn?: PoolConnection) {
  const runner = conn ?? pool;
  const { userId, sourceType, packageId, jumlahToken, masaBerlakuHari, grantedBy, catatan } = input;

  await runner.query(
    `INSERT INTO token_batches
      (user_id, source_type, package_id, jumlah_token_awal, sisa_token, expiry_date, granted_by, catatan, created_at)
     VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?, NOW())`,
    [userId, sourceType, packageId, jumlahToken, jumlahToken, masaBerlakuHari, grantedBy, catatan ?? null]
  );
}
