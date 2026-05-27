'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import { addUser } from '@/actions/users';

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setError('Password tidak cocok.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await addUser(formData);
    setLoading(false);

    if (result.success) {
      router.push('/admin/users');
    } else {
      setError(result.error || 'Gagal menambahkan pengguna.');
    }
  };

  return (
    <div className="p-4 pb-24 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-white">Tambah Pengguna</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass-card p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Username</label>
            <input type="text" name="username" required className="input-field" placeholder="username" autoComplete="off" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nama Lengkap</label>
            <input type="text" name="fullName" required className="input-field" placeholder="Nama Lengkap" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email (Opsional)</label>
            <input type="email" name="email" className="input-field" placeholder="email@contoh.com" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Role</label>
            <select name="role" required className="input-field">
              <option value="INSPECTOR">Petugas Inspeksi</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Password</label>
            <input type="password" name="password" required minLength={6} className="input-field" placeholder="Minimal 6 karakter" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Konfirmasi Password</label>
            <input type="password" name="confirmPassword" required minLength={6} className="input-field" placeholder="Ketik ulang password" />
          </div>
        </div>

        {error && <div className="glass-card p-3 border-red-500/30 text-red-400 text-sm font-bold text-center">{error}</div>}

        <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
          {loading ? 'Menyimpan...' : 'Tambah Pengguna'}
        </button>
      </form>
    </div>
  );
}
