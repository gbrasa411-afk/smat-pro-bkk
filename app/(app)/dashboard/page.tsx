import Link from 'next/link';
import {
  QrCode,
  Package,
  AlertTriangle,
  ClipboardCheck,
  ArrowRight,
  Clock,
  User,
  CheckCircle,
  FlaskConical,
  HeartPulse,
} from 'lucide-react';
import { getAssetStats } from '@/actions/assets';
import { getInspectionHistory, getInspectionStats } from '@/actions/inspections';

function getStatusStyle(status: string) {
  switch (status) {
    case 'Normal': return 'status-normal';
    case 'Perlu Perbaikan': return 'status-warning';
    case 'Rusak Berat': return 'status-danger';
    default: return 'status-neutral';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Normal': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case 'Perlu Perbaikan': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    case 'Rusak Berat': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return '-';
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return `${Math.floor(diffHours / 24)} hari lalu`;
}

export default async function DashboardPage() {
  const [assetStats, inspectionStats, recentInspections] = await Promise.all([
    getAssetStats(),
    getInspectionStats(),
    getInspectionHistory(undefined, 5),
  ]);

  return (
    <div className="px-5 py-4 space-y-6 stagger-children">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00916E] via-[#00A37D] to-[#00B386] p-5 shadow-xl shadow-[#00916E]/20">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-16 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white mb-1">
            Mulai Inspeksi Aset
          </h3>
          <p className="text-sm text-white/70 mb-4">
            Scan QR code atau masukkan ID peralatan
          </p>
          <Link
            href="/inspection/scan"
            className="inline-flex items-center gap-2 bg-white text-[#00916E] font-bold text-sm py-3 px-5 rounded-xl
                       hover:bg-green-50 active:scale-95 transition-all duration-200 shadow-lg"
          >
            <QrCode className="w-5 h-5" />
            Mulai Inspeksi
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="w-10 h-10 rounded-xl bg-[#00916E]/10 flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-[#00916E]" />
          </div>
          <p className="text-2xl font-black text-gray-900">{assetStats.total}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Total Aset</p>
        </div>

        <div className="glass-card p-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">{assetStats.needAction}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Perlu Tindakan</p>
        </div>

        <div className="glass-card p-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{inspectionStats.monthlyInspections}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Inspeksi Bulan Ini</p>
        </div>

        <div className="glass-card p-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <HeartPulse className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{assetStats.categoriesCount || 0}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Kategori Aset</p>
        </div>
      </div>

      {/* Aktivitas Terkini */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Aktivitas Terkini</h3>
          <Link
            href="/inspection"
            className="flex items-center gap-1 text-xs text-[#00916E] font-semibold hover:text-[#007A5C] transition-colors"
          >
            Lihat Semua
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentInspections.length === 0 && (
            <div className="glass-card p-8 text-center">
              <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Belum ada inspeksi tercatat</p>
            </div>
          )}
          {recentInspections.map((activity, index) => (
            <Link
              key={activity.id}
              href={`/inventory/${activity.assetId}`}
              className="glass-card-hover flex items-center gap-3.5 p-3.5"
              style={{ animationDelay: `${0.3 + index * 0.05}s` }}
            >
              <div className="flex-shrink-0">
                {getStatusIcon(activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {activity.assetName || activity.assetId}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray-400 font-mono">
                    {activity.assetId}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <User className="w-3 h-3" />
                    {activity.inspectorName}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`status-badge ${getStatusStyle(activity.status)}`}>
                  {activity.status}
                </span>
                <span className="text-[10px] text-gray-400">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
