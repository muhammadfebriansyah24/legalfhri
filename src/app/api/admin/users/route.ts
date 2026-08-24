import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  if (session.role !== "superadmin") {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  let sql = "SELECT id, nama_perusahaan, email, no_whatsapp, role, created_at FROM users";
  const params: string[] = [];

  if (q) {
    sql += " WHERE nama_perusahaan LIKE ? OR email LIKE ? OR no_whatsapp LIKE ?";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  sql += " ORDER BY created_at DESC LIMIT 50";

  try {
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
