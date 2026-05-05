'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Ledger, ApiResponse } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { useCompanyStore } from '@/store/useCompanyStore';

export function useLedgers() {
  const token = useAuthStore(state => state.token);
  const selectedCompany = useCompanyStore(state => state.selectedCompany);
  
  return useQuery({
    queryKey: ['ledgers', selectedCompany?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    },
    enabled: !!token && !!selectedCompany?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
