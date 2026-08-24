import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { deductOneTokenAndClose } from '@/lib/tokenDeduct';
import type { SessionData } from '@/lib/session';

export class ForbiddenError extends Error {}
export class NotFoundError extends Error {}
export class AlreadyClosedError extends Error {}

/**
 * Selesaikan Konsultasi / Force Close — satu jalur pemotongan token yang sama
 * persis, sesuai PRD §6.4 poin terakhir.
 */
export async function closeConsultation(session: SessionData, consultationId: string) {
  if (session.role !== 'admin_legal' && session.role !== 'superadmin') {
    throw new ForbiddenError();
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, user_id, status FROM consultations WHERE id = ?',
    [consultationId]
  );
  if (rows.length === 0) throw new NotFoundError();
  const consultation = rows[0];
  if (consultation.status === 'closed') throw new AlreadyClosedError();

  await deductOneTokenAndClose(consultation.user_id, consultation.id);
}
