import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export class InsufficientTokenError extends Error {
  constructor() {
    super('Token user sudah habis, tidak bisa menutup kasus dengan pemotongan token.');
  }
}

/**
 * Potong 1 token dari batch dengan expiry paling dekat (FIFO), lalu tutup konsultasi.
 * Dibungkus transaksi + row lock (FOR UPDATE) agar aman dari race condition
 * saat dua admin menutup kasus milik user yang sama bersamaan. PRD §6.4.
 */
export async function deductOneTokenAndClose(userId: number, consultationId: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [batches] = await conn.query<RowDataPacket[]>(
      `SELECT id, sisa_token FROM token_batches
       WHERE user_id = ? AND sisa_token > 0 AND expiry_date >= NOW()
       ORDER BY expiry_date ASC
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    let batchId: number;

    if (batches.length === 0) {
      // ponytail: fallback ke batch expired jika masa berlaku habis saat konsultasi berjalan
      const [expiredBatches] = await conn.query<RowDataPacket[]>(
        `SELECT id, sisa_token FROM token_batches
         WHERE user_id = ? AND sisa_token > 0
         ORDER BY expiry_date ASC
         LIMIT 1
         FOR UPDATE`,
        [userId]
      );
      if (expiredBatches.length === 0) {
        await conn.rollback();
        throw new InsufficientTokenError();
      }
      batchId = expiredBatches[0].id;
    } else {
      batchId = batches[0].id;
    }

    await conn.query('UPDATE token_batches SET sisa_token = sisa_token - 1 WHERE id = ?', [batchId]);
    await conn.query(
      "UPDATE consultations SET status = 'closed', batch_id_terpakai = ? WHERE id = ?",
      [batchId, consultationId]
    );

    await conn.commit();
    return batchId;
  } catch (err) {
    try { await conn.rollback(); } catch {}
    throw err;
  } finally {
    conn.release();
  }
}
