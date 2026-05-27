import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getUnreadCount } from '@/actions/notifications';

interface AppHeaderProps {
  user: {
    fullName: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'INSPECTOR';
    username: string;
  };
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return { label: 'Super Admin', className: 'role-super-admin' };
    case 'ADMIN':
      return { label: 'Admin', className: 'role-admin' };
    case 'INSPECTOR':
      return { label: 'Inspektor', className: 'role-inspector' };
    default:
      return { label: role, className: 'role-inspector' };
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function AppHeader({ user }: AppHeaderProps) {
  const roleBadge = getRoleBadge(user.role);
  const initials = getInitials(user.fullName);
  const unreadCount = await getUnreadCount();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 pt-safe">
        {/* Left: greeting */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium">Selamat Bekerja,</p>
          <h2 className="text-base font-bold text-gray-900 truncate">
            {user.fullName}
          </h2>
          <span className={`status-badge mt-1 ${roleBadge.className}`}>
            {roleBadge.label}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3 ml-3">
          <Link
            href="/notifications"
            className="relative touch-target rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-red-500/30"
                style={{ width: 18, height: 18 }}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00916E] to-[#00B386] flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-[#00916E]/20 active:scale-95 transition-transform"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
