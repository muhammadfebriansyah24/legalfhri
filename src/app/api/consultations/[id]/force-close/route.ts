import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { closeConsultation, ForbiddenError, NotFoundError, AlreadyClosedError } from '@/lib/closeConsultation';
import { InsufficientTokenError } from '@/lib/tokenDeduct';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const { id } = await params;
  try {
    await closeConsultation(session, id);
    return NextResponse.json({ status: 'success' });
  } catch (err) {
    if (err instanceof ForbiddenError) return NextResponse.json({ error: 'Tidak berwenang.' }, { status: 403 });
    if (err instanceof NotFoundError) return NextResponse.json({ error: 'Konsultasi tidak ditemukan.' }, { status: 404 });
    if (err instanceof AlreadyClosedError) return NextResponse.json({ error: 'Kasus sudah closed.' }, { status: 400 });
    if (err instanceof InsufficientTokenError) return NextResponse.json({ error: err.message }, { status: 400 });
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
