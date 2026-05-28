'use client';

import { deleteAsset } from '@/actions/assets';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DeleteAssetButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus aset ini?')) return;
    setLoading(true);
    const res = await deleteAsset(id);
    setLoading(false);
    if (res.success) {
      router.push('/inventory');
      router.refresh();
    } else {
      alert(res.error || 'Gagal menghapus aset.');
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-danger w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl active:scale-95 transition-all duration-200"
    >
      <Trash2 className="w-5 h-5" />
      {loading ? 'Menghapus...' : 'Hapus Aset'}
    </button>
  );
}
