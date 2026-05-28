'use client';

import { usePathname } from 'next/navigation';

export default function LayoutWrapper({
  header,
  bottomNav,
  children,
}: {
  header: React.ReactNode;
  bottomNav: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide global header and bottom nav on inspection wizard and scan pages
  // Example: /inspection/LAB-FOG-001 or /inspection/scan
  // Do not hide them on the inspection history list page (/inspection)
  const isInspectionWizardOrScan = pathname.startsWith('/inspection/') && pathname !== '/inspection';

  if (isInspectionWizardOrScan) {
    return (
      <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
      {header}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      {bottomNav}
    </div>
  );
}
