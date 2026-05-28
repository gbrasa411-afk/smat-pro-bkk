import { Suspense } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Package,
  FlaskConical,
  HeartPulse,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { getAssets } from '@/actions/assets';
import { getCategories } from '@/actions/categories';
import InventoryClient from './inventory-client';
import { auth } from '@/lib/auth';

export default async function InventoryPage() {
  const [assets, categories] = await Promise.all([
    getAssets(),
    getCategories(),
  ]);

  const session = await auth();

  // Group assets by category
  const grouped = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    assets: assets.filter((a) => a.categoryId === cat.id),
  }));

  return <InventoryClient categories={grouped} userRole={session?.user?.role || 'INSPECTOR'} />;
}
