'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { QuantumBoundary } from '@/components/ErrorBoundaries/QuantumBoundary';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <QuantumBoundary>
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }
          }}
        />
      </QuantumBoundary>
    </QueryClientProvider>
  );
}
