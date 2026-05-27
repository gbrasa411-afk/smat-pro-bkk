import { auth } from '@/lib/auth';
import { db } from '@/db';
import { assets, categories } from '@/db/schema';
import { eq, and, lt, or } from 'drizzle-orm';
import { Calendar, AlertTriangle, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

interface AssetRow {
  id: string;
  name: string;
  location: string | null;
  lastStatus: string;
  lastInspectedAt: Date | null;
  categoryName: string | null;
  daysSinceInspection: number;
  urgency: 'red' | 'yellow' | 'ok';
}

export default async function SchedulePage() {
  const session = await auth();
  if (!session) return null;

  const now = new Date();

  // Get all active assets with their inspection dates
  const allAssets = await db
    .select({
      id: assets.id,
      name: assets.name,
      location: assets.location,
      lastStatus: assets.lastStatus,
      lastInspectedAt: assets.lastInspectedAt,
      categoryName: categories.name,
    })
    .from(assets)
    .leftJoin(categories, eq(assets.categoryId, categories.id))
    .where(eq(assets.isActive, true));

  // Categorize assets by urgency
  const categorized: AssetRow[] = allAssets.map((a) => {
    let daysSince = 999;
    if (a.lastInspectedAt) {
      daysSince = Math.ceil(
        (now.getTime() - new Date(a.lastInspectedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    let urgency: 'red' | 'yellow' | 'ok' = 'ok';
    if (a.lastStatus === 'Belum Diinspeksi' || daysSince > 90) {
      urgency = 'red';
    } else if (daysSince > 30) {
      urgency = 'yellow';
    }

    return { ...a, daysSinceInspection: daysSince, urgency };
  });

  const criticalAssets = categorized.filter((a) => a.urgency === 'red');
  const warningAssets = categorized.filter((a) => a.urgency === 'yellow');
  const okAssets = categorized.filter((a) => a.urgency === 'ok');

  return (
    <div className="p-4 pb-24 space-y-5">
      <h2 className="text-xl font-black text-gray-900">Jadwal & Monitoring</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3 border-l-4 border-l-red-400">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle size={12} className="text-red-500" />
            <p className="text-[9px] font-bold text-red-500 uppercase">Kritis</p>
          </div>
          <p className="text-xl font-black text-red-600">{criticalAssets.length}</p>
          <p className="text-[9px] text-gray-400">&gt;90 hari / belum</p>
        </div>
        <div className="glass-card p-3 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={12} className="text-amber-500" />
            <p className="text-[9px] font-bold text-amber-500 uppercase">Peringatan</p>
          </div>
          <p className="text-xl font-black text-amber-600">{warningAssets.length}</p>
          <p className="text-[9px] text-gray-400">&gt;30 hari</p>
        </div>
        <div className="glass-card p-3 border-l-4 border-l-emerald-400">
          <div className="flex items-center gap-1 mb-1">
            <Calendar size={12} className="text-emerald-500" />
            <p className="text-[9px] font-bold text-emerald-500 uppercase">Aman</p>
          </div>
          <p className="text-xl font-black text-emerald-600">{okAssets.length}</p>
          <p className="text-[9px] text-gray-400">&lt;30 hari</p>
        </div>
      </div>

      {/* Critical Section - RED */}
      {criticalAssets.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Kritis — Segera Inspeksi!
          </h3>
          <div className="space-y-2">
            {criticalAssets.map((a) => (
              <Link
                key={a.id}
                href={`/inspection/${a.id}`}
                className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-red-400 hover:shadow-md transition-all block active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{a.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-bold font-mono">{a.id}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[10px] text-gray-400">{a.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {a.location || '-'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-red-600">
                    {a.lastInspectedAt ? `${a.daysSinceInspection}h` : '—'}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {a.lastInspectedAt ? 'lalu' : 'Belum pernah'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Warning Section - YELLOW */}
      {warningAssets.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={16} /> Peringatan — Perlu Segera Diinspeksi
          </h3>
          <div className="space-y-2">
            {warningAssets.map((a) => (
              <Link
                key={a.id}
                href={`/inspection/${a.id}`}
                className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-amber-400 hover:shadow-md transition-all block active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={18} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{a.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-bold font-mono">{a.id}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[10px] text-gray-400">{a.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {a.location || '-'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-amber-600">{a.daysSinceInspection}h</p>
                  <p className="text-[9px] text-gray-400">lalu</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* OK Section - GREEN */}
      {okAssets.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={16} /> Aman — Inspeksi Terkini
          </h3>
          <div className="space-y-2">
            {okAssets.map((a) => (
              <Link
                key={a.id}
                href={`/inventory/${a.id}`}
                className="glass-card p-4 flex items-center gap-3 hover:shadow-md transition-all block active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Calendar size={18} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{a.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-bold font-mono">{a.id}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[10px] text-gray-400">{a.categoryName}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-emerald-600">{a.daysSinceInspection}h</p>
                  <p className="text-[9px] text-gray-400">lalu</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {allAssets.length === 0 && (
        <div className="text-center py-16">
          <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Belum ada aset terdaftar</p>
        </div>
      )}
    </div>
  );
}
