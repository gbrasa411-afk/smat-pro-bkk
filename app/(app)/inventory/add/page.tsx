'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tag,
  FileText,
  MapPin,
  Car,
  StickyNote,
  Camera,
  Loader2,
  ImageIcon,
  X,
} from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { showToast } from '@/components/ui/toast';

const mainCategories = [
  { value: 'Kendaraan', label: 'Kendaraan' },
  { value: 'Heavy Equipment', label: 'Heavy Equipment' },
  { value: 'Genset & Power', label: 'Genset & Power' },
  { value: 'Peralatan Kerja', label: 'Peralatan Kerja' },
];

const assetTypes: Record<string, Array<{ value: string; label: string }>> = {
  Kendaraan: [
    { value: 'Dump Truck', label: 'Dump Truck' },
    { value: 'Pickup', label: 'Pickup' },
    { value: 'Bus', label: 'Bus / Minibus' },
    { value: 'Trailer', label: 'Trailer' },
  ],
  'Heavy Equipment': [
    { value: 'Excavator', label: 'Excavator' },
    { value: 'Bulldozer', label: 'Bulldozer' },
    { value: 'Crane', label: 'Crane' },
    { value: 'Forklift', label: 'Forklift' },
    { value: 'Loader', label: 'Loader' },
  ],
  'Genset & Power': [
    { value: 'Genset', label: 'Genset' },
    { value: 'Transformer', label: 'Transformer' },
    { value: 'UPS', label: 'UPS' },
  ],
  'Peralatan Kerja': [
    { value: 'Mesin Las', label: 'Mesin Las' },
    { value: 'Kompresor', label: 'Kompresor' },
    { value: 'Pompa', label: 'Pompa' },
    { value: 'Lainnya', label: 'Lainnya' },
  ],
};

export default function AddAssetPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    assetId: '',
    name: '',
    category: '',
    type: '',
    location: '',
    noPolisi: '',
    notes: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const isVehicle = form.category === 'Kendaraan';
  const availableTypes = form.category ? assetTypes[form.category] || [] : [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'assetId' ? value.toUpperCase() : value,
      ...(name === 'category' ? { type: '' } : {}),
    }));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Call server action
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showToast('success', 'Aset berhasil ditambahkan!');
      router.push('/inventory');
    } catch {
      showToast('error', 'Gagal menambahkan aset. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-4">
      <PageHeader title="Tambah Aset Baru" subtitle="Isi data peralatan baru" showBack backHref="/inventory" />

      <form onSubmit={handleSubmit} className="px-5 space-y-4">
        {/* ID Peralatan */}
        <div className="glass-card p-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Informasi Aset</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              ID Peralatan *
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="assetId"
                value={form.assetId}
                onChange={handleChange}
                className="input-field pl-11 font-mono uppercase"
                placeholder="Contoh: HE-001"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Nama Alat / Merek *
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field pl-11"
                placeholder="Contoh: Excavator CAT 320D"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Kategori Utama *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="select-field"
              required
            >
              <option value="" className="bg-slate-800">Pilih kategori...</option>
              {mainCategories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-slate-800">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
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
              <option value="" className="bg-slate-800">
                {form.category ? 'Pilih jenis...' : 'Pilih kategori dulu'}
              </option>
              {availableTypes.map((t) => (
                <option key={t.value} value={t.value} className="bg-slate-800">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Lokasi Penempatan *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input-field pl-11"
                placeholder="Contoh: Site A - Area Tambang"
                required
              />
            </div>
          </div>

          {/* No. Polisi - only shown for vehicles */}
          {isVehicle && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                No. Polisi *
              </label>
              <div className="relative">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="noPolisi"
                  value={form.noPolisi}
                  onChange={handleChange}
                  className="input-field pl-11 uppercase"
                  placeholder="Contoh: B 1234 ABC"
                  required={isVehicle}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Catatan
            </label>
            <div className="relative">
              <StickyNote className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="textarea-field pl-11 min-h-[100px]"
                placeholder="Catatan tambahan (opsional)"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Foto Aset</h3>

          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${photo})` }}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}

            {/* Add photo button */}
            <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/30 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
              <Camera className="w-5 h-5 text-slate-500" />
              <span className="text-[10px] text-slate-500 font-medium">Tambah</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !form.assetId || !form.name || !form.category || !form.type || !form.location}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Aset'
          )}
        </button>
      </form>
    </div>
  );
}
