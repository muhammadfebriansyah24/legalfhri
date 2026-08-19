import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export type TokenBatchRow = RowDataPacket & {
  id: number;
  source_type: 'free_trial' | 'package' | 'manual';
  sisa_token: number;
  expiry_date: string;
};

/** Total saldo = SUM sisa_token dari batch yang belum expired. PRD §6.3 */
export async function getTotalBalance(userId: number): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COALESCE(SUM(sisa_token), 0) AS total_saldo
     FROM token_batches
     WHERE user_id = ? AND expiry_date >= NOW()`,
    [userId]
  );
  return Number(rows[0].total_saldo);
}

/** Rincian per batch aktif, urut expiry paling dekat. Dipakai di dashboard. */
export async function getActiveBatches(userId: number): Promise<TokenBatchRow[]> {
  const [rows] = await pool.query<TokenBatchRow[]>(
    `SELECT id, source_type, sisa_token, expiry_date
     FROM token_batches
     WHERE user_id = ? AND expiry_date >= NOW() AND sisa_token > 0
     ORDER BY expiry_date ASC`,
    [userId]
  );
  return rows;
}
