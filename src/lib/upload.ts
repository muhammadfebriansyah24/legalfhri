import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB, PRD §7.1

export const STORAGE_DIR = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage', 'consultation-docs');

export class UploadError extends Error {}

/**
 * Validasi + simpan file ke folder privat di luar /public.
 * Return path relatif (disimpan di messages.file_url) — bukan URL publik.
 */
export async function saveUploadedFile(file: File, userId: number): Promise<string> {
  if (!ALLOWED_TYPES[file.type]) {
    throw new UploadError('Tipe file tidak diizinkan. Hanya PDF, PNG, JPG/JPEG.');
  }
  if (file.size > MAX_SIZE) {
    throw new UploadError('Ukuran file melebihi 5 MB.');
  }

  await mkdir(STORAGE_DIR, { recursive: true });

  const ext = ALLOWED_TYPES[file.type];
  const safeBase = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const filename = `${Date.now()}-user${userId}-${safeBase.replace(/\.[^.]+$/, '')}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(STORAGE_DIR, filename), buffer);

  return filename;
}
