'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Package,
  FlaskConical,
  HeartPulse,
  MapPin,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string | null;
  categoryIcon: string | null;
  assetTypeId: string;
  assetTypeName: string | null;
  assetTypeIcon: string | null;
  location: string | null;
  plateNumber: string | null;
  lastStatus: string;
  lastInspectedAt: Date | null;
  nextInspectionDue: Date | null;
  qrCode: string | null;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: string | null;
  assets: Asset[];
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'Normal': return 'status-normal';
    case 'Perlu Perbaikan': return 'status-warning';
    case 'Rusak Berat': return 'status-danger';
    case 'Belum Diinspeksi': return 'status-neutral';
    default: return 'status-neutral';
  }
}

function getCategoryIcon(iconName: string | null) {
  switch (iconName) {
    case 'FlaskConical': return FlaskConical;
    case 'HeartPulse': return HeartPulse;
    default: return Package;
  }
}

function getInspectionUrgency(lastInspectedAt: Date | null): 'ok' | 'yellow' | 'red' {
  if (!lastInspectedAt) return 'red';
  const now = new Date();
  const daysSince = Math.ceil((now.getTime() - new Date(lastInspectedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince > 90) return 'red';
  if (daysSince > 30) return 'yellow';
  return 'ok';
}

function getUrgencyBorder(urgency: 'ok' | 'yellow' | 'red') {
  switch (urgency) {
    case 'red': return 'border-l-4 border-l-red-400';
    case 'yellow': return 'border-l-4 border-l-amber-400';
    default: return '';
  }
}

export default function InventoryClient({ categories }: { categories: CategoryGroup[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => !activeFilter || cat.id === activeFilter)
      .map((cat) => ({
        ...cat,
        assets: cat.assets.filter((asset) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return asset.name.toLowerCase().includes(q) || asset.id.toLowerCase().includes(q);
        }),
      }))
      .filter((cat) => cat.assets.length > 0 || !searchQuery);
  }, [categories, activeFilter, searchQuery]);

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
        <input
          type="search"
          placeholder="Cari aset berdasarkan nama atau ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-11 text-sm"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setActiveFilter(null)}
          className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
            !activeFilter
              ? 'bg-[#00916E] text-white shadow-lg shadow-[#00916E]/20'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                activeFilter === cat.id
                  ? 'bg-[#00916E] text-white shadow-lg shadow-[#00916E]/20'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Category Sections */}
      <div className="space-y-3">
        {filteredCategories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const isExpanded = expandedCategories.has(cat.id);

          return (
            <div key={cat.id} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#00916E]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-[18px] h-[18px] text-[#00916E]" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-[11px] text-gray-400">{cat.assets.length} unit</p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {cat.assets.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-400">Belum ada aset dalam kategori ini</p>
                    </div>
                  )}
                  {cat.assets.map((asset, idx) => {
                    const urgency = getInspectionUrgency(asset.lastInspectedAt);
                    return (
                      <Link
                        key={asset.id}
                        href={`/inventory/${asset.id}`}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-all ${getUrgencyBorder(urgency)} ${
                          idx > 0 ? 'border-t border-gray-100' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {asset.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-gray-400 font-mono">{asset.id}</span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                              <MapPin className="w-2.5 h-2.5" />
                              {asset.location || '-'}
                            </span>
                          </div>
                        </div>
                        <span className={`status-badge flex-shrink-0 ${getStatusStyle(asset.lastStatus)}`}>
                          {asset.lastStatus}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-500 mb-1">Tidak Ada Hasil</h3>
            <p className="text-sm text-gray-400">Coba ubah kata kunci pencarian Anda</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/inventory/add"
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-[#00916E] rounded-2xl flex items-center justify-center
                   shadow-xl shadow-[#00916E]/25 active:scale-90 transition-all duration-200 hover:bg-[#007A5C]
                   animate-pulse-glow"
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  );
}
