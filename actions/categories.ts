'use server';

import { db } from '@/db';
import { categories, assetTypes } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getAssetTypes(categoryId?: string) {
  if (categoryId) {
    return db.select().from(assetTypes).where(eq(assetTypes.categoryId, categoryId));
  }
  return db.select().from(assetTypes);
}

export async function getCategoriesWithTypes() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const types = await db.select().from(assetTypes);
  
  return cats.map((cat) => ({
    ...cat,
    types: types.filter((t) => t.categoryId === cat.id),
  }));
}

export async function addCategory(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'ADMIN') {
    return { error: 'Hanya Admin.' };
  }

  const name = formData.get('name') as string;
  const icon = formData.get('icon') as string;
  if (!name) return { error: 'Nama kategori wajib diisi.' };

  try {
    await db.insert(categories).values({ name, icon: icon || 'Package' });
    revalidatePath('/admin/categories');
    revalidatePath('/inventory');
    return { success: true };
  } catch { return { error: 'Kategori sudah ada.' }; }
}

export async function addAssetType(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'ADMIN') {
    return { error: 'Hanya Admin.' };
  }

  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const icon = formData.get('icon') as string;
  if (!name || !categoryId) return { error: 'Data tidak lengkap.' };

  try {
    await db.insert(assetTypes).values({ name, categoryId, icon: icon || 'Box' });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch { return { error: 'Jenis aset sudah ada.' }; }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'ADMIN') {
    return { error: 'Hanya Admin.' };
  }

  try {
    await db.delete(assetTypes).where(eq(assetTypes.categoryId, id));
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/admin/categories');
    return { success: true };
  } catch { return { error: 'Gagal menghapus kategori.' }; }
}
