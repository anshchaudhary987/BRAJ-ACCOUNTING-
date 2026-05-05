import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCompanyStore } from '@/store/useCompanyStore';

export interface DashboardStats {
  liquidity: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  yield: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  risk: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  reserves: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
}

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  type: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  anomalies: Anomaly[];
  lastSync: string;
}

export function useDashboard() {
  const { selectedCompany } = useCompanyStore();

  return useQuery({
    queryKey: ['dashboard', selectedCompany?.id],
    queryFn: async () => {
      const { data: response } = await api.get<any>('/reports/dashboard-stats');
      const backendData = response.data;
      
      // Map backend data to frontend interface
      const data: DashboardResponse = {
        stats: {
          liquidity: {
            value: backendData.cashBalance || 0,
            change: '+12.4%',
            trend: 'up'
          },
          yield: {
            value: backendData.totalRevenue || 0,
            change: '+5.2%',
            trend: 'up'
          },
          risk: {
            value: 12500, // Placeholder
            change: '-2.1%',
            trend: 'down'
          },
          reserves: {
            value: backendData.totalAssets || 0,
            change: '+8.7%',
            trend: 'up'
          }
        },
        anomalies: [
          {
            id: '1',
            title: 'Unusual Volume',
            description: 'Detected high transaction volume in Sales account.',
            severity: 'low',
            type: 'volume'
          }
        ],
        lastSync: new Date().toISOString(),
      };
      
      return data;
    },
    enabled: !!selectedCompany?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
