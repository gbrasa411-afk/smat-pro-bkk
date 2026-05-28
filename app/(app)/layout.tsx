import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppHeader from '@/components/layout/app-header';
import BottomNav from '@/components/layout/bottom-nav';
import LayoutWrapper from './layout-wrapper';

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
    <LayoutWrapper
      header={<AppHeader user={session.user} />}
      bottomNav={<BottomNav />}
    >
      {children}
    </LayoutWrapper>
  );
}

