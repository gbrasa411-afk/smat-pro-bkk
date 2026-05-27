'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const addUserSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'INSPECTOR']),
});

export async function getUsers() {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') return [];
  
  return db.select({
    id: users.id,
    username: users.username,
    fullName: users.fullName,
    role: users.role,
    email: users.email,
    isActive: users.isActive,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt));
}

export async function addUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') return { error: 'Hanya Super Admin yang dapat menambahkan pengguna.' };

  const parsed = addUserSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    email: formData.get('email') || '',
    role: formData.get('role'),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  try {
    await db.insert(users).values({
      username: parsed.data.username,
      password: hashedPassword,
      fullName: parsed.data.fullName,
      email: parsed.data.email || null,
      role: parsed.data.role,
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('unique') || msg.includes('duplicate')) return { error: 'Username sudah digunakan.' };
    return { error: 'Gagal menambahkan pengguna.' };
  }
}

export async function toggleUserActive(userId: string) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') return { error: 'Tidak memiliki akses.' };
  if (session.user.id === userId) return { error: 'Tidak dapat menonaktifkan akun sendiri.' };

  const user = await db.select({ isActive: users.isActive }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return { error: 'Pengguna tidak ditemukan.' };

  await db.update(users).set({ isActive: !user[0].isActive, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath('/admin/users');
  return { success: true };
}
