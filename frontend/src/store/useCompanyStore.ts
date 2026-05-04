import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company } from '@/types';

interface CompanyState {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      selectedCompany: null,
      setSelectedCompany: (company) => set({ selectedCompany: company }),
    }),
    {
      name: 'tally-killer-company-storage',
    }
  )
);
