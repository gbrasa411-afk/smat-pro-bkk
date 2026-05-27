'use client';

import { CheckCheck } from 'lucide-react';
import { markAllRead } from '@/actions/notifications';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NotificationActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkAll = async () => {
    setLoading(true);
    await markAllRead();
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-[#00916E] font-semibold hover:text-[#007A5C] transition-colors disabled:opacity-50"
    >
      <CheckCheck className="w-4 h-4" />
      Tandai Semua
    </button>
  );
}
