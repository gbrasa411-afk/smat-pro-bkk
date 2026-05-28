'use server';

import { db } from '@/db';
import { assets, categories, assetTypes } from '@/db/schema';
import { eq, desc, and, sql, like, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const addAssetSchema = z.object({
  id: z.string().min(1, 'ID wajib diisi').toUpperCase(),
  name: z.string().min(1, 'Nama aset wajib diisi'),
  categoryId: z.string().uuid(),
  assetTypeId: z.string().uuid(),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  plateNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function getAssets(search?: string, categoryFilter?: string) {
  const conditions = [eq(assets.isActive, true)];
  if (categoryFilter) {
    conditions.push(eq(assets.categoryId, categoryFilter));
  }

  const result = await db
    .select({
      id: assets.id,
      name: assets.name,
      categoryId: assets.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      assetTypeId: assets.assetTypeId,
      assetTypeName: assetTypes.name,
      assetTypeIcon: assetTypes.icon,
      location: assets.location,
      plateNumber: assets.plateNumber,
      lastStatus: assets.lastStatus,
      lastInspectedAt: assets.lastInspectedAt,
      nextInspectionDue: assets.nextInspectionDue,
      qrCode: assets.qrCode,
    })
    .from(assets)
    .leftJoin(categories, eq(assets.categoryId, categories.id))
    .leftJoin(assetTypes, eq(assets.assetTypeId, assetTypes.id))
    .where(and(...conditions))
    .orderBy(desc(assets.updatedAt));

  if (search) {
    const lower = search.toLowerCase();
    return result.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        a.id.toLowerCase().includes(lower) ||
        (a.location?.toLowerCase().includes(lower) ?? false)
    );
  }
  return result;
}

export async function getAssetById(id: string) {
  const result = await db
    .select({
      id: assets.id,
      name: assets.name,
      categoryId: assets.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      assetTypeId: assets.assetTypeId,
      assetTypeName: assetTypes.name,
      location: assets.location,
      plateNumber: assets.plateNumber,
      lastStatus: assets.lastStatus,
      lastInspectedAt: assets.lastInspectedAt,
      lastInspectedBy: assets.lastInspectedBy,
      nextInspectionDue: assets.nextInspectionDue,
      photoUrl: assets.photoUrl,
      qrCode: assets.qrCode,
      notes: assets.notes,
      createdAt: assets.createdAt,
    })
    .from(assets)
    .leftJoin(categories, eq(assets.categoryId, categories.id))
    .leftJoin(assetTypes, eq(assets.assetTypeId, assetTypes.id))
    .where(eq(assets.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function addAsset(formData: FormData) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return { error: 'Tidak memiliki akses.' };
  }

  const parsed = addAssetSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    categoryId: formData.get('categoryId'),
    assetTypeId: formData.get('assetTypeId'),
    location: formData.get('location'),
    plateNumber: formData.get('plateNumber') || undefined,
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.insert(assets).values({
      ...parsed.data,
      lastStatus: 'Belum Diinspeksi',
      qrCode: parsed.data.id,
    });
    revalidatePath('/inventory');
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return { error: 'ID Aset sudah digunakan.' };
    }
    return { error: 'Gagal menyimpan data: ' + msg };
  }
}

export async function getAssetStats() {
  const total = await db.select({ count: sql<number>`count(*)` }).from(assets).where(eq(assets.isActive, true));
  const needAction = await db
    .select({ count: sql<number>`count(*)` })
    .from(assets)
    .where(and(eq(assets.isActive, true), or(eq(assets.lastStatus, 'Perlu Perbaikan'), eq(assets.lastStatus, 'Rusak Berat'))));

  return {
    total: Number(total[0].count),
    needAction: Number(needAction[0].count),
  };
}

export async function editAsset(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return { error: 'Tidak memiliki akses.' };
  }

  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const assetTypeId = formData.get('assetTypeId') as string;
  const location = formData.get('location') as string;
  const plateNumber = formData.get('plateNumber') as string || null;
  const notes = formData.get('notes') as string || null;

  if (!name || !categoryId || !assetTypeId || !location) {
    return { error: 'Data wajib diisi.' };
  }

  try {
    await db
      .update(assets)
      .set({
        name,
        categoryId,
        assetTypeId,
        location,
        plateNumber,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(assets.id, id));

    revalidatePath('/inventory');
    revalidatePath(`/inventory/${id}`);
    return { success: true };
  } catch (e: any) {
    return { error: 'Gagal memperbarui aset: ' + e.message };
  }
}

export async function deleteAsset(id: string) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return { error: 'Tidak memiliki akses.' };
  }

  try {
    await db.update(assets).set({ isActive: false }).where(eq(assets.id, id));
    revalidatePath('/inventory');
    return { success: true };
  } catch (e: any) {
    return { error: 'Gagal menghapus aset: ' + e.message };
  }
}

