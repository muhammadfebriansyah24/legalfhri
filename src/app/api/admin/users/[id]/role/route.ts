import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import type { ResultSetHeader } from "mysql2";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  if (session.role !== "superadmin") {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 403 });
  }

  const { id } = await params;
  const userId = Number(id);

  if (userId === session.id) {
    return NextResponse.json(
      { error: "Anda tidak bisa mengubah role Anda sendiri." },
      { status: 400 }
    );
  }

  try {
    const { role } = await request.json();
    
    const validRoles = ["user", "admin_legal", "digital_marketing", "superadmin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Role berhasil diubah." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
