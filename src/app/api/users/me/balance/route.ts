import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTotalBalance, getActiveBatches } from '@/lib/tokenBalance';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const [total, batches] = await Promise.all([
    getTotalBalance(session.id),
    getActiveBatches(session.id),
  ]);

  return NextResponse.json({ total_saldo: total, batches });
}
