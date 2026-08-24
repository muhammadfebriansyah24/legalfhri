import pool from "./db";
import type { RowDataPacket } from "mysql2";
import { deductOneTokenAndClose } from "./tokenDeduct";

export async function runAutoClose() {
  // Single query: get active consultations where last message was from non-user and > 72h ago
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.id, c.user_id
     FROM consultations c
     INNER JOIN (
       SELECT m.consultation_id,
              MAX(m.id) AS last_msg_id
       FROM messages m
       GROUP BY m.consultation_id
     ) lm ON lm.consultation_id = c.id
     INNER JOIN messages m2 ON m2.id = lm.last_msg_id
     INNER JOIN users u ON u.id = m2.sender_id
     WHERE c.status = 'active'
       AND u.role != 'user'
       AND m2.created_at <= DATE_SUB(NOW(), INTERVAL 72 HOUR)`
  );

  let closedCount = 0;

  for (const c of rows) {
    try {
      await deductOneTokenAndClose(c.user_id, c.id);
      closedCount++;

      await pool.query(
        `INSERT INTO messages (consultation_id, sender_id, pesan, created_at)
         SELECT ?, id, 'Sistem: Konsultasi ini ditutup otomatis karena tidak ada respons dari klien dalam 3x24 jam.', NOW()
         FROM users WHERE role = 'superadmin' LIMIT 1`,
        [c.id]
      );
    } catch {
      // ponytail: skip one ticket failure so others still process; add logging when observability is set up
    }
  }

  return closedCount;
}
