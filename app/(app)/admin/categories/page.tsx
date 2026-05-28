'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Package, Trash2, Loader2, ClipboardCheck } from 'lucide-react';
import { getCategoriesWithTypes, addCategory, addAssetType, deleteCategory } from '@/actions/categories';
import { showToast } from '@/components/ui/toast';

interface CategoryWithTypes {
  id: string;
  name: string;
  icon: string | null;
  types: { id: string; name: string; icon: string | null }[];
}

export default function CategoriesPage() {
  const router = useRouter();
  const [cats, setCats] = useState<CategoryWithTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await getCategoriesWithTypes();
      setCats(data);
    } catch (err) {
      showToast('error', 'Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set('name', newCatName);
      fd.set('icon', 'Package');
      const res = await addCategory(fd);
      if (res?.error) {
        showToast('error', res.error);
      } else {
        showToast('success', 'Kategori berhasil ditambahkan!');
        setNewCatName('');
        await loadData();
      }
    } catch {
      showToast('error', 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddType = async () => {
    if (!newTypeName.trim() || !selectedCat) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set('name', newTypeName);
      fd.set('categoryId', selectedCat);
      fd.set('icon', 'Box');
      const res = await addAssetType(fd);
      if (res?.error) {
        showToast('error', res.error);
      } else {
        showToast('success', 'Jenis aset berhasil ditambahkan!');
        setNewTypeName('');
        await loadData();
      }
    } catch {
      showToast('error', 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm('Yakin hapus kategori ini beserta semua jenis asetnya?')) return;
    try {
      const res = await deleteCategory(id);
      if (res?.error) {
        showToast('error', res.error);
      } else {
        showToast('success', 'Kategori berhasil dihapus.');
        await loadData();
      }
    } catch {
      showToast('error', 'Gagal menghapus kategori.');
    }
  };

  return (
    <div className="p-4 pb-24 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-700 transition-all active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-gray-900">Kelola Kategori</h2>
      </div>

      {/* Add Category */}
      <div className="glass-card p-4 space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tambah Kategori Baru</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="input-field flex-1"
            placeholder="Nama kategori baru..."
          />
          <button
            onClick={handleAddCategory}
            disabled={saving || !newCatName.trim()}
            className="btn-primary py-2.5 px-4 disabled:opacity-30 flex items-center justify-center"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>

      {/* Add Asset Type */}
      <div className="glass-card p-4 space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tambah Jenis Aset</p>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="select-field"
        >
          <option value="">-- Pilih Kategori --</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            className="input-field flex-1"
            placeholder="Nama jenis aset baru..."
            disabled={!selectedCat}
          />
          <button
            onClick={handleAddType}
            disabled={saving || !newTypeName.trim() || !selectedCat}
            className="btn-primary py-2.5 px-4 disabled:opacity-30 flex items-center justify-center"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Kategori Terdaftar</p>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : cats.map((cat) => (
          <div key={cat.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00916E]/10 flex items-center justify-center">
                  <Package size={18} className="text-[#00916E]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                  <p className="text-[10px] text-gray-400">{cat.types.length} jenis aset</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteCat(cat.id)}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95 border border-red-200"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {cat.types.length > 0 && (
              <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Jenis Aset (Ketuk untuk edit checklist):
                </p>
                <div className="flex flex-wrap gap-2">
                  {cat.types.map((t) => (
                    <Link
                      key={t.id}
                      href={`/admin/categories/${t.id}/checklist`}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#00916E]/30 hover:bg-[#00916E]/5 flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <ClipboardCheck size={13} className="text-[#00916E]" />
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
