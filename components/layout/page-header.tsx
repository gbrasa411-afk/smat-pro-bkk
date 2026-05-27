'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  backHref,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center gap-3 px-5 py-4">
      {showBack && (
        backHref ? (
          <Link
            href={backHref}
            className="touch-target -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
        ) : (
          <button
            onClick={handleBack}
            className="touch-target -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
        )
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
