import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppHeader from '@/components/layout/app-header';
import BottomNav from '@/components/layout/bottom-nav';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
      <AppHeader user={session.user} />
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
