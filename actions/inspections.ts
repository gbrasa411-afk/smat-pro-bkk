'use server';

import { db } from '@/db';
import { inspections, assets, checklistTemplates, assetTypes } from '@/db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

interface ChecklistResultInput {
  label: string;
  category: string;
  status: 'baik' | 'rusak' | 'na';
  notes?: string;
}

export async function getChecklistForAsset(assetId: string) {
  const asset = await db.select({ assetTypeId: assets.assetTypeId }).from(assets).where(eq(assets.id, assetId)).limit(1);
  if (!asset[0]) return [];

  const template = await db
    .select({ items: checklistTemplates.items })
    .from(checklistTemplates)
    .where(eq(checklistTemplates.assetTypeId, asset[0].assetTypeId))
    .limit(1);

  if (!template[0]) return [];
  return template[0].items as { label: string; category: string }[];
}

export async function saveInspection(data: {
  assetId: string;
  checklistResults: ChecklistResultInput[];
  notes: string;
  photoBase64: string;
  signatureBase64: string;
  nextInspectionDate: string;
  serviceData?: {
    serviceDate: string;
    serviceType: string;
    description?: string;
    partsReplaced?: string;
    cost?: number;
    workshopName?: string;
    mileage?: number;
    nextServiceDate?: string;
    nextServiceType?: string;
  };
}) {
  const session = await auth();
  if (!session?.user) return { error: 'Tidak terautentikasi.' };

  try {
    // Upload photo to Supabase Storage
    let photoUrl = '';
    if (data.photoBase64) {
      const photoBuffer = Buffer.from(data.photoBase64.split(',')[1], 'base64');
      const photoName = `inspections/${data.assetId}_foto_${Date.now()}.jpg`;
      const { data: uploaded, error } = await supabase.storage
        .from('smat-files')
        .upload(photoName, photoBuffer, { contentType: 'image/jpeg', upsert: true });
      if (!error && uploaded) {
        const { data: urlData } = supabase.storage.from('smat-files').getPublicUrl(photoName);
        photoUrl = urlData.publicUrl;
      }
    }

    // Upload signature
    let signatureUrl = '';
    if (data.signatureBase64) {
      const sigBuffer = Buffer.from(data.signatureBase64.split(',')[1], 'base64');
      const sigName = `signatures/${data.assetId}_ttd_${Date.now()}.png`;
      const { data: uploaded, error } = await supabase.storage
        .from('smat-files')
        .upload(sigName, sigBuffer, { contentType: 'image/png', upsert: true });
      if (!error && uploaded) {
        const { data: urlData } = supabase.storage.from('smat-files').getPublicUrl(sigName);
        signatureUrl = urlData.publicUrl;
      }
    }

    // Calculate status
    const rusakCount = data.checklistResults.filter((r) => r.status === 'rusak').length;
    const criticalRusak = data.checklistResults.filter(
      (r) => r.status === 'rusak' && ['Mesin', 'Rem', 'Kelistrikan', 'Keamanan'].some((c) => r.category.includes(c))
    ).length;

    let status: 'Normal' | 'Perlu Perbaikan' | 'Rusak Berat' = 'Normal';
    if (criticalRusak >= 2 || rusakCount >= 5) status = 'Rusak Berat';
    else if (rusakCount > 0) status = 'Perlu Perbaikan';

    // Convert to schema-compatible format
    const schemaResults = data.checklistResults.map((r) => ({
      label: r.label,
      category: r.category,
      result: r.status === 'baik' ? 'pass' as const : r.status === 'rusak' ? 'fail' as const : 'na' as const,
      notes: r.notes,
    }));

    // Save inspection
    await db.insert(inspections).values({
      assetId: data.assetId,
      inspectorId: session.user.id,
      inspectorName: session.user.fullName,
      status,
      checklistResults: schemaResults,
      notes: data.notes || null,
      photoUrl,
      signatureUrl,
      nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
    });

    // Update asset status
    await db
      .update(assets)
      .set({
        lastStatus: status,
        lastInspectedAt: new Date(),
        lastInspectedBy: session.user.id,
        nextInspectionDue: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(assets.id, data.assetId));

    // Save vehicle service if provided
    if (data.serviceData?.serviceDate) {
      const { vehicleServices } = await import('@/db/schema');
      await db.insert(vehicleServices).values({
        assetId: data.assetId,
        serviceDate: new Date(data.serviceData.serviceDate),
        serviceType: data.serviceData.serviceType,
        description: data.serviceData.description || null,
        partsReplaced: data.serviceData.partsReplaced || null,
        cost: data.serviceData.cost?.toString() || null,
        nextServiceDate: data.serviceData.nextServiceDate ? new Date(data.serviceData.nextServiceDate) : null,
        nextServiceType: data.serviceData.nextServiceType || null,
        workshopName: data.serviceData.workshopName || null,
        mileage: data.serviceData.mileage || null,
        performedBy: session.user.id,
      });
    }

    revalidatePath('/inventory');
    revalidatePath('/dashboard');
    revalidatePath('/schedule');
    return { success: true, status };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return { error: 'Gagal menyimpan inspeksi: ' + msg };
  }
}

export async function getInspectionHistory(assetId?: string, limit = 20) {
  const conditions = assetId ? [eq(inspections.assetId, assetId)] : [];

  return db
    .select({
      id: inspections.id,
      assetId: inspections.assetId,
      assetName: assets.name,
      inspectorName: inspections.inspectorName,
      status: inspections.status,
      photoUrl: inspections.photoUrl,
      createdAt: inspections.createdAt,
      notes: inspections.notes,
    })
    .from(inspections)
    .leftJoin(assets, eq(inspections.assetId, assets.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(inspections.createdAt))
    .limit(limit);
}

export async function getInspectionStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(inspections)
    .where(gte(inspections.createdAt, startOfMonth));

  return { monthlyInspections: Number(monthlyCount[0].count) };
}
