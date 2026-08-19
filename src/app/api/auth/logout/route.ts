import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ status: 'success' });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
