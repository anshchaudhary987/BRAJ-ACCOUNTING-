'use client';

import { useCompanyStore } from '@/store/useCompanyStore';
import ProDashboard from '@/components/dashboard/ProDashboard';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();

  useEffect(() => {
    if (!selectedCompany) {
      router.push('/company/setup');
    }
  }, [selectedCompany, router]);

  if (!selectedCompany) return null;

  return <ProDashboard />;
}
