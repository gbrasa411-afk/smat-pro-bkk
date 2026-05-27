import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUsers } from '@/actions/users';
import { toggleUserActive } from '@/actions/users';
import { Users, Plus, Shield, ShieldCheck, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/dashboard');

  const userList = await getUsers();

  const roleIcons: Record<string, React.ReactNode> = {
    SUPER_ADMIN: <Shield size={16} className="text-violet-400" />,
    ADMIN: <ShieldCheck size={16} className="text-blue-400" />,
    INSPECTOR: <ClipboardCheck size={16} className="text-green-400" />,
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    INSPECTOR: 'Petugas Inspeksi',
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    ADMIN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    INSPECTOR: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div className="p-4 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">Manajemen Pengguna</h2>
        <Link href="/admin/users/add" className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2">
          <Plus size={16} /> Tambah
        </Link>
      </div>

      <div className="space-y-3">
        {userList.map((u) => (
          <div key={u.id} className={`glass-card p-4 flex items-center gap-3 ${!u.isActive ? 'opacity-50' : ''}`}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-white font-bold text-sm border border-white/10">
              {u.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{u.fullName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleColors[u.role]}`}>
                  {roleLabels[u.role]}
                </span>
                <span className="text-[10px] text-slate-600">@{u.username}</span>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-slate-600'}`} title={u.isActive ? 'Aktif' : 'Nonaktif'} />
          </div>
        ))}
      </div>

      {userList.length === 0 && (
        <div className="text-center py-16">
          <Users size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Belum ada pengguna</p>
        </div>
      )}
    </div>
  );
}
