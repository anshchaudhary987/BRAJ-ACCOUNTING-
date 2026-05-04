'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCompanyStore } from '@/store/useCompanyStore';

export function useTenancy() {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublicPage = pathname === '/company/setup';
    
    if (!selectedCompany && !isPublicPage) {
      router.push('/company/setup');
    }
  }, [selectedCompany, pathname, router]);

  return { selectedCompany };
}
