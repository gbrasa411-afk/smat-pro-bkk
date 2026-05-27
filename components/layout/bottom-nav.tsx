'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ClipboardCheck,
  Calendar,
  User,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Beranda', icon: Home },
  { href: '/inventory', label: 'Inventaris', icon: Package },
  { href: '/inspection', label: 'Inspeksi', icon: ClipboardCheck },
  { href: '/schedule', label: 'Jadwal', icon: Calendar },
  { href: '/profile', label: 'Profil', icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/60 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-[70px] max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-0.5 w-16 h-14
                  transition-all duration-200 active:scale-90 relative
                  ${active ? 'text-[#00916E]' : 'text-gray-400'}
                `}
              >
                <div className="relative">
                  <Icon
                    className={`transition-all duration-200 ${
                      active ? 'stroke-[2.5]' : 'stroke-[1.8]'
                    }`}
                    style={{ width: 22, height: 22 }}
                  />
                  {active && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00916E] rounded-full shadow-[0_0_6px_2px_rgba(0,145,110,0.5)]" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold transition-all duration-200 ${
                    active ? 'text-[#00916E]' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
