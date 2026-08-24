import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export type Role = 'user' | 'admin_legal' | 'digital_marketing' | 'superadmin';

export type SessionData = {
  id: number;
  role: Role;
  nama: string;
};

const COOKIE_NAME = 'user_session';
const MAX_AGE = 60 * 60 * 24; // 24 jam

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET belum diset di .env.local');
  return s;
}

function toBase64Url(bytes: ArrayBuffer) {
  const b = Buffer.from(bytes).toString('base64');
  return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Web Crypto (crypto.subtle) dipakai (bukan node:crypto) karena harus jalan di
// dua runtime sekaligus: Node.js (API routes/Server Components) DAN Edge
// Runtime (middleware.ts). node:crypto tidak tersedia di Edge Runtime.
async function hmacKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function sign(payload: string) {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toBase64Url(sig);
}

/** Bungkus data session jadi cookie value "base64(payload).signature" */
export async function encodeSession(data: SessionData) {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(data)).buffer as ArrayBuffer);
  return `${payload}.${await sign(payload)}`;
}

/** Verifikasi & decode cookie value. Return null kalau invalid/tampered. */
export async function decodeSession(cookieValue: string | undefined): Promise<SessionData | null> {
  if (!cookieValue) return null;
  const [payload, sig] = cookieValue.split('.');
  if (!payload || !sig) return null;

  const expected = await sign(payload);
  if (expected.length !== sig.length || expected !== sig) return null;

  try {
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Dipakai di Server Components / API routes (App Router) */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE_NAME)?.value);
}

/** Dipakai di middleware.ts (Edge runtime, tidak ada next/headers cookies()) */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionData | null> {
  return decodeSession(req.cookies.get(COOKIE_NAME)?.value);
}

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE,
  };
}

export { COOKIE_NAME };
