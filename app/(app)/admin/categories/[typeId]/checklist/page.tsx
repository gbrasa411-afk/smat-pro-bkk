'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Loader2, ListChecks } from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { showToast } from '@/components/ui/toast';
import { getChecklistTemplate, updateChecklistTemplate } from '@/actions/inspections';
import { getAssetTypes } from '@/actions/categories';

interface ChecklistItem {
  label: string;
  category: string;
}

export default function ChecklistEditorPage({ params }: { params: Promise<{ typeId: string }> }) {
  const router = useRouter();
  const { typeId } = use(params);

  const [typeName, setTypeName] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [types, template] = await Promise.all([
          getAssetTypes(),
          getChecklistTemplate(typeId),
        ]);

        const currentType = types.find((t) => t.id === typeId);
        if (currentType) {
          setTypeName(currentType.name);
        } else {
          showToast('error', 'Jenis aset tidak ditemukan.');
          router.push('/admin/categories');
          return;
        }

        setItems(template.length > 0 ? template : [{ label: '', category: '' }]);
      } catch (err) {
        showToast('error', 'Gagal memuat data dari database.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [typeId, router]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { label: '', category: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ChecklistItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    // Validate that there are no empty items
    const filteredItems = items.filter((item) => item.label.trim() && item.category.trim());
    if (filteredItems.length === 0) {
      showToast('error', 'Harap isi minimal 1 pertanyaan dengan lengkap (Label & Kategori).');
      return;
    }

    setSaving(true);
    try {
      const res = await updateChecklistTemplate(typeId, filteredItems);
      if (res?.success) {
        showToast('success', 'Checklist template berhasil disimpan!');
        router.push('/admin/categories');
        router.refresh();
      } else {
        showToast('error', res?.error || 'Gagal menyimpan template.');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#00916E] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-semibold text-sm">Memuat data checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-700 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-black text-gray-900">Kelola Pertanyaan</h2>
            <p className="text-xs text-gray-400 font-medium">Checklist: {typeName}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Simpan
        </button>
      </div>

      {/* Editor List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between ml-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Daftar Pertanyaan Kondisi Aset ({items.length})
          </p>
          <span className="text-[10px] text-gray-400 italic">
            * Field kosong akan diabaikan saat menyimpan
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="glass-card p-4 space-y-3 relative border-l-4 border-l-[#00916E]">
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="pr-10 space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Pertanyaan #{idx + 1} *
                  </label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleChange(idx, 'label', e.target.value)}
                    placeholder="Contoh: Apakah lensa objektif bersih?"
                    className="input-field text-sm py-2 px-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Kategori Pertanyaan *
                    </label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => handleChange(idx, 'category', e.target.value)}
                      placeholder="Contoh: Fisik, Optik, Mesin..."
                      className="input-field text-sm py-2 px-3"
                    />
                  </div>
                  <div className="flex items-end justify-start pl-1 pb-1">
                    <span className="text-[10px] text-gray-400 italic">
                      Dikelompokkan saat inspeksi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        <button
          onClick={handleAddItem}
          className="w-full py-4 border-2 border-dashed border-gray-200 hover:border-[#00916E]/40 hover:text-[#00916E] rounded-xl flex items-center justify-center gap-2 text-gray-400 font-bold transition-all active:scale-[0.99] text-sm bg-white"
        >
          <Plus size={18} />
          Tambah Baris Pertanyaan
        </button>

        {/* Bottom Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 mt-4"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={20} />
              Simpan Semua Pertanyaan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
