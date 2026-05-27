import { auth } from '@/lib/auth';
import { logoutAction } from '@/actions/auth';
import { Shield, User, Settings, Package, FolderPlus, Users, ChevronRight, LogOut, Bell } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;
  const { fullName, role, id } = session.user;

  const roleBadge = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ADMIN: { label: 'Admin', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    INSPECTOR: { label: 'Petugas Inspeksi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  }[role] || { label: role, color: 'bg-gray-100 text-gray-600 border-gray-200' };

  return (
    <div className="p-4 pb-24 space-y-5">
      <h2 className="text-xl font-black text-gray-900">Profil</h2>

      {/* User Card */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00916E] to-[#00B386] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-[#00916E]/20">
          {fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900">{fullName}</h3>
          <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${roleBadge.color}`}>
            {roleBadge.label}
          </span>
        </div>
      </div>

      {/* Admin Menu */}
      {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Menu Administrator</p>
          <Link href="/inventory/add" className="glass-card p-4 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98] block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00916E]/10 flex items-center justify-center"><FolderPlus size={18} className="text-[#00916E]" /></div>
              <span className="font-bold text-gray-900 text-sm">Tambah Aset Baru</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          <Link href="/notifications" className="glass-card p-4 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98] block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Bell size={18} className="text-amber-500" /></div>
              <span className="font-bold text-gray-900 text-sm">Notifikasi</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
        </div>
      )}

      {/* Super Admin Menu */}
      {role === 'SUPER_ADMIN' && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Super Admin</p>
          <Link href="/admin/users" className="glass-card p-4 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98] block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Users size={18} className="text-indigo-600" /></div>
              <span className="font-bold text-gray-900 text-sm">Manajemen Pengguna</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          <Link href="/admin/categories" className="glass-card p-4 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98] block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Package size={18} className="text-amber-600" /></div>
              <span className="font-bold text-gray-900 text-sm">Kelola Kategori Aset</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
        </div>
      )}

      {/* App Info */}
      <div className="glass-card p-4 text-center space-y-1">
        <p className="text-xs font-bold text-gray-500">SMAT PRO v1.0</p>
        <p className="text-[10px] text-gray-400">Balai Kekarantinaan Kesehatan Kelas II Tembilahan</p>
        <p className="text-[10px] text-gray-400">Kementerian Kesehatan Republik Indonesia</p>
      </div>

      {/* Logout */}
      <form action={logoutAction}>
        <button type="submit" className="w-full glass-card p-4 flex items-center justify-center gap-3 text-red-500 font-bold hover:bg-red-50 hover:border-red-200 transition-all active:scale-[0.98] mt-2">
          <LogOut size={18} />
          Keluar Aplikasi
        </button>
      </form>
    </div>
  );
}
