import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getNotifications } from '@/actions/notifications';
import NotificationActions from './notification-actions';

function getNotifIcon(type: string) {
  switch (type) {
    case 'DANGER': return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'INFO': default: return <Info className="w-5 h-5 text-indigo-500" />;
  }
}

function getNotifBg(type: string, isRead: boolean) {
  if (isRead) return 'bg-white';
  switch (type) {
    case 'DANGER': return 'bg-red-50/50 border-l-4 border-l-red-400';
    case 'WARNING': return 'bg-amber-50/50 border-l-4 border-l-amber-400';
    case 'SUCCESS': return 'bg-emerald-50/50 border-l-4 border-l-emerald-400';
    case 'INFO': default: return 'bg-indigo-50/50 border-l-4 border-l-indigo-400';
  }
}

function formatNotifDate(date: Date | null): string {
  if (!date) return '-';
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifikasi</h2>
          <p className="text-xs text-gray-400">
            {notifications.filter((n) => !n.isRead).length} belum dibaca
          </p>
        </div>
        <NotificationActions />
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-500 mb-1">Tidak Ada Notifikasi</h3>
            <p className="text-sm text-gray-400">Semua sudah terbaca</p>
          </div>
        )}

        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`glass-card p-4 transition-all ${getNotifBg(notif.type, notif.isRead)} ${
              notif.isRead ? 'opacity-70' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {formatNotifDate(notif.createdAt)}
                  </span>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="flex items-center gap-1 text-[11px] text-[#00916E] font-semibold hover:text-[#007A5C] transition-colors"
                    >
                      Lihat Detail
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
