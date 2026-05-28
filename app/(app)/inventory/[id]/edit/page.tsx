'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, FileText, MapPin, Car, StickyNote, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { showToast } from '@/components/ui/toast';
import { getCategoriesWithTypes } from '@/actions/categories';
import { getAssetById, editAsset } from '@/actions/assets';

interface CategoryWithTypes {
  id: string;
  name: string;
  icon: string | null;
  types: { id: string; name: string; icon: string | null }[];
}

const PREDEFINED_LOCATIONS = [
  'Tembilahan',
  'Sungai Guntung',
  'Kuala Gaung',
  'Kuala Enok',
  'Pulau Kijang',
  'Rengat',
];

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryWithTypes[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    category: '', // categoryId
    type: '',     // assetTypeId
    location: '',
    noPolisi: '',
    notes: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [catsData, assetData] = await Promise.all([
          getCategoriesWithTypes(),
          getAssetById(id),
        ]);
        setCategories(catsData);

        if (assetData) {
          setForm({
            name: assetData.name,
            category: assetData.categoryId,
            type: assetData.assetTypeId,
            location: assetData.location || '',
            noPolisi: assetData.plateNumber || '',
            notes: assetData.notes || '',
          });
        } else {
          showToast('error', 'Aset tidak ditemukan.');
          router.push('/inventory');
        }
      } catch (err) {
        showToast('error', 'Gagal memuat data dari database.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  const selectedCategoryObj = categories.find((c) => c.id === form.category);
  const isVehicle = selectedCategoryObj?.name === 'Kendaraan';
  const availableTypes = selectedCategoryObj?.types || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { type: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.type || !form.location) {
      showToast('error', 'Mohon lengkapi semua field wajib.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.set('name', form.name);
      fd.set('categoryId', form.category);
      fd.set('assetTypeId', form.type);
      fd.set('location', form.location);
      if (isVehicle && form.noPolisi) {
        fd.set('plateNumber', form.noPolisi);
      }
      if (form.notes) {
        fd.set('notes', form.notes);
      }

      const res = await editAsset(id, fd);
      if (res?.success) {
        showToast('success', 'Aset berhasil diperbarui!');
        router.push(`/inventory/${id}`);
        router.refresh();
      } else {
        showToast('error', res?.error || 'Gagal memperbarui aset.');
      }
    } catch (err) {
      showToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#00916E] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-semibold text-sm">Memuat data aset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <PageHeader title="Edit Informasi Aset" subtitle={id} showBack backHref={`/inventory/${id}`} />

      <form onSubmit={handleSubmit} className="px-5 space-y-4">
        {/* ID Aset (Readonly) */}
        <div className="glass-card p-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Informasi Aset</h3>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              ID Aset (Monospace)
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={id}
                disabled
                className="input-field pl-11 font-mono uppercase bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Nama Alat / Merek *
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field pl-11"
                placeholder="Contoh: Mikroskop Olympus CX24"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Kategori Utama *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="select-field"
              required
            >
              <option value="">Pilih kategori...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Jenis Aset *
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="select-field"
              required
              disabled={!form.category}
            >
              <option value="">
                {form.category ? 'Pilih jenis...' : 'Pilih kategori dulu'}
              </option>
              {availableTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Lokasi Penempatan *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="select-field pl-11"
                required
              >
                <option value="">Pilih lokasi...</option>
                {PREDEFINED_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* No. Polisi - only shown for vehicles */}
          {isVehicle && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                No. Polisi *
              </label>
              <div className="relative">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="noPolisi"
                  value={form.noPolisi}
                  onChange={handleChange}
                  className="input-field pl-11 uppercase"
                  placeholder="Contoh: BM 1234 A"
                  required={isVehicle}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Catatan
            </label>
            <div className="relative">
              <StickyNote className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="textarea-field pl-11 min-h-[80px]"
                placeholder="Catatan tambahan (opsional)"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !form.name || !form.category || !form.type || !form.location}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </button>
      </form>
    </div>
  );
}
