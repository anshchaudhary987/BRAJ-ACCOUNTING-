'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Ledger, ApiResponse } from '@/types';

export function useLedgers() {
  return useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
