import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'SMAT PRO — BKK Kelas II Tembilahan',
  description: 'Sistem Monitoring Aset Terpadu — Balai Kekarantinaan Kesehatan Kelas II Tembilahan',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SMAT PRO',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00916E',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="id">
      <body className="min-h-dvh bg-[#F5F7FA] text-gray-900 antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
