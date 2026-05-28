import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Tag,
  Calendar,
  User,
  ClipboardCheck,
  QrCode,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { getAssetById } from '@/actions/assets';
import { getInspectionHistory } from '@/actions/inspections';
import { auth } from '@/lib/auth';
import DeleteAssetButton from '@/components/inventory/delete-button';


function getStatusStyle(status: string) {
  switch (status) {
    case 'Normal': return 'status-normal';
    case 'Perlu Perbaikan': return 'status-warning';
    case 'Rusak Berat': return 'status-danger';
    default: return 'status-neutral';
  }
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAssetById(id);
  if (!asset) notFound();

  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const inspections = await getInspectionHistory(id, 5);


  return (
    <div className="pb-4">
      <PageHeader title="Detail Aset" showBack backHref="/inventory" />

      <div className="px-5 space-y-4">
        {/* Main info card */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-mono font-black text-[#00916E] tracking-wider">
              {asset.id}
            </span>
            <span className={`status-badge text-xs px-3 py-1.5 ${getStatusStyle(asset.lastStatus)}`}>
              {asset.lastStatus}
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900">{asset.name}</h2>

          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Kategori / Jenis</p>
                <p className="text-sm text-gray-900 font-medium">{asset.categoryName} — {asset.assetTypeName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Lokasi</p>
                <p className="text-sm text-gray-900 font-medium">{asset.location || '-'}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Inspeksi Terakhir</p>
                <p className="text-sm text-gray-900 font-medium">{formatDate(asset.lastInspectedAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-[#00916E]" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Inspeksi Selanjutnya</p>
                <p className="text-sm text-[#00916E] font-semibold">{formatDate(asset.nextInspectionDue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <Link
            href={`/inspection/${asset.id}`}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <ClipboardCheck className="w-5 h-5" />
            Inspeksi Sekarang
          </Link>

          {isAdmin && (
            <div className="flex gap-2">
              <Link
                href={`/inventory/${asset.id}/edit`}
                className="flex-1 btn-outline w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-gray-300 text-center font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-sm"
              >
                Edit Aset
              </Link>
              <div className="flex-1">
                <DeleteAssetButton id={asset.id} />
              </div>
            </div>
          )}
        </div>

        {/* Recent Inspection History */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">Riwayat Terbaru</h3>
          <div className="space-y-2">
            {inspections.length === 0 && (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-gray-400">Belum ada riwayat inspeksi</p>
              </div>
            )}
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className="glass-card-hover flex items-center gap-3 p-3.5"
              >
                <div className="flex-shrink-0">
                  {insp.status === 'Normal' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{formatDate(insp.createdAt)}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3" />
                    {insp.inspectorName}
                  </p>
                </div>
                <span className={`status-badge ${getStatusStyle(insp.status)}`}>
                  {insp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
