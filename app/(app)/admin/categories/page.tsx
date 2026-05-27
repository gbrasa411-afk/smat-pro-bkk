'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Package, Trash2, Loader2 } from 'lucide-react';
import { getCategoriesWithTypes, addCategory, addAssetType, deleteCategory } from '@/actions/categories';

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
    const data = await getCategoriesWithTypes();
    setCats(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setSaving(true);
    const fd = new FormData();
    fd.set('name', newCatName);
    fd.set('icon', 'Package');
    await addCategory(fd);
    setNewCatName('');
    await loadData();
    setSaving(false);
  };

  const handleAddType = async () => {
    if (!newTypeName.trim() || !selectedCat) return;
    setSaving(true);
    const fd = new FormData();
    fd.set('name', newTypeName);
    fd.set('categoryId', selectedCat);
    fd.set('icon', 'Box');
    await addAssetType(fd);
    setNewTypeName('');
    await loadData();
    setSaving(false);
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm('Yakin hapus kategori ini beserta semua jenis asetnya?')) return;
    await deleteCategory(id);
    await loadData();
  };

  return (
    <div className="p-4 pb-24 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-white">Kelola Kategori</h2>
      </div>

      {/* Add Category */}
      <div className="glass-card p-4 space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tambah Kategori Baru</p>
        <div className="flex gap-2">
          <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="input-field flex-1" placeholder="Nama kategori..." />
          <button onClick={handleAddCategory} disabled={saving || !newCatName.trim()} className="btn-primary py-2.5 px-4 disabled:opacity-30">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>

      {/* Add Asset Type */}
      <div className="glass-card p-4 space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tambah Jenis Aset</p>
        <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="input-field">
          <option value="">-- Pilih Kategori --</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="text" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} className="input-field flex-1" placeholder="Nama jenis aset..." />
          <button onClick={handleAddType} disabled={saving || !newTypeName.trim() || !selectedCat} className="btn-primary py-2.5 px-4 disabled:opacity-30">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kategori Terdaftar</p>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
        ) : cats.map((cat) => (
          <div key={cat.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Package size={18} className="text-blue-400" /></div>
                <div>
                  <p className="text-sm font-bold text-white">{cat.name}</p>
                  <p className="text-[10px] text-slate-500">{cat.types.length} jenis aset</p>
                </div>
              </div>
              <button onClick={() => handleDeleteCat(cat.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all active:scale-95">
                <Trash2 size={14} />
              </button>
            </div>
            {cat.types.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {cat.types.map((t) => (
                  <span key={t.id} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/10">{t.name}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
