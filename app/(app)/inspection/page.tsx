import Link from 'next/link';
import {
  ClipboardCheck,
  User,
  Calendar,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import { getInspectionHistory } from '@/actions/inspections';

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
    case 'Normal': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    case 'Perlu Perbaikan': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    case 'Rusak Berat': return <XCircle className="w-5 h-5 text-red-600" />;
    default: return <Clock className="w-5 h-5 text-gray-400" />;
  }
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMonthKey(date: Date | null): string {
  if (!date) return 'unknown';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  if (key === 'unknown') return 'Tanggal Tidak Diketahui';
  const [year, month] = key.split('-');
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

interface InspectionItem {
  id: string;
  assetId: string;
  assetName: string | null;
  inspectorName: string;
  status: string;
  photoUrl: string | null;
  createdAt: Date | null;
  notes: string | null;
}

export default async function InspectionPage() {
  const inspections = await getInspectionHistory(undefined, 50);

  // Group by month
  const grouped = new Map<string, InspectionItem[]>();
  for (const insp of inspections) {
    const key = getMonthKey(insp.createdAt);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(insp);
  }

  // Sort month keys descending
  const sortedKeys = [...grouped.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Riwayat Inspeksi</h2>
          <p className="text-xs text-gray-400">{inspections.length} laporan ditemukan</p>
        </div>
        <Link
          href="/inspection/scan"
          className="text-xs font-semibold text-[#00916E] bg-[#00916E]/10 px-3 py-1.5 rounded-lg hover:bg-[#00916E]/20 transition-colors"
        >
          + Inspeksi Baru
        </Link>
      </div>

      {/* Monthly Grouped List */}
      {sortedKeys.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <ClipboardCheck className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-bold text-gray-500 mb-1">
            Belum Ada Inspeksi
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Mulai inspeksi pertama Anda
          </p>
          <Link href="/inspection/scan" className="btn-primary text-sm">
            Mulai Inspeksi
          </Link>
        </div>
      )}

      {sortedKeys.map((monthKey) => {
        const items = grouped.get(monthKey)!;
        return (
          <div key={monthKey} className="space-y-2">
            {/* Month Header */}
            <div className="flex items-center gap-2 pt-2">
              <Calendar className="w-4 h-4 text-[#00916E]" />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                {getMonthLabel(monthKey)}
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                {items.length}
              </span>
            </div>

            {/* Inspection Cards */}
            <div className="space-y-2">
              {items.map((insp) => (
                <div
                  key={insp.id}
                  className="glass-card-hover flex items-start gap-3.5 p-4"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(insp.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {insp.assetName || insp.assetId}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-400 font-mono">{insp.assetId}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {insp.inspectorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(insp.createdAt)}
                      </span>
                    </div>
                    {insp.notes && (
                      <p className="text-[11px] text-gray-400 mt-1.5 italic line-clamp-1">
                        &ldquo;{insp.notes}&rdquo;
                      </p>
                    )}
                    <div className="mt-2">
                      <span className={`status-badge ${getStatusStyle(insp.status)}`}>
                        {insp.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
