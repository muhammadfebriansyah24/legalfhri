import pool from "./db";
import type { RowDataPacket } from "mysql2";
import { deductOneTokenAndClose } from "./tokenDeduct";

export async function runAutoClose() {
  // Ambil semua konsultasi yang berstatus aktif
  const [activeConsultations] = await pool.query<RowDataPacket[]>(
    "SELECT id, user_id, topik FROM consultations WHERE status = 'active'"
  );

  let closedCount = 0;

  for (const c of activeConsultations) {
    // Ambil pesan terakhir di konsultasi ini beserta role pengirimnya
    const [msgs] = await pool.query<RowDataPacket[]>(
      `SELECT m.created_at, u.role 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.consultation_id = ? 
       ORDER BY m.id DESC 
       LIMIT 1`,
      [c.id]
    );

    let lastActivityDate: Date | null = null;
    let lastSenderRole: string | null = null;

    if (msgs.length > 0) {
      lastActivityDate = new Date(msgs[0].created_at);
      lastSenderRole = msgs[0].role;
    }

    // Jika admin sudah merespons (role bukan 'user') dan user belum membalas selama 3x24 jam (72 jam)
    if (lastActivityDate && lastSenderRole && lastSenderRole !== "user") {
      const now = new Date();
      const diffMs = now.getTime() - lastActivityDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours >= 72) {
        try {
          // Lakukan pemotongan token FIFO dan tutup konsultasi
          await deductOneTokenAndClose(c.user_id, c.id);
          closedCount++;
          
          // Kirim pesan sistem penutupan otomatis ke room chat agar tercatat di histori
          await pool.query(
            `INSERT INTO messages (consultation_id, sender_id, pesan, created_at)
             SELECT ?, id, 'Sistem: Konsultasi ini ditutup otomatis karena tidak ada respons dari klien dalam 3x24 jam.', NOW()
             FROM users WHERE role = 'superadmin' LIMIT 1`,
            [c.id]
          );
        } catch (err) {
          // Lewati jika terjadi error saat memproses (misal token benar-benar 0 dan tidak ada batch sama sekali)
          // ponytail: abaikan kegagalan satu tiket agar tidak menghambat tiket lainnya
        }
      }
    }
  }

  return closedCount;
}
