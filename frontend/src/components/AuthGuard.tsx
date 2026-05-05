'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

import { useCompanyStore } from '@/store/useCompanyStore';

const PUBLIC_ROUTES = ['/login', '/signup', '/'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  
  const router = useRouter();
  const pathname = usePathname();
  const [verifying, setVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      const isPublic = PUBLIC_ROUTES.includes(pathname);
      
      // 1. If public route, just allow it
      if (isPublic) {
        return;
      }

      // 2. If no token, must login
      if (!token) {
        router.push('/login');
        return;
      }

      // 3. Verify user and company access if not already verifying
      if (!verifying && !user) {
        setVerifying(true);
        try {
          const res = await api.get('/auth/me');
          const userData = res.data.user;
          
          if (!userData) {
            throw new Error('User data missing from response');
          }
          
          // Update user info in store
          setAuth(userData, token);
          
          // Validate current company selection
          if (selectedCompany) {
            const hasAccess = userData.companies?.some((c: any) => c.id === selectedCompany.id);
            if (!hasAccess) {
              console.warn('User no longer has access to current company. Resetting selection.');
              useCompanyStore.getState().setSelectedCompany(null);
            }
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          logout();
          router.push('/login');
        } finally {
          setVerifying(false);
        }
      }

      // 4. If authenticated but no company selected (and not on setup page or home)
      if (user && !selectedCompany && pathname !== '/company/setup' && pathname !== '/') {
        router.push('/company/setup');
      }
    };

    checkAuth();
  }, [pathname, token, !!user, !!selectedCompany, router, setAuth, logout, mounted]);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // Don't render anything until mounted to avoid hydration issues with persistent stores
  if (!mounted) {
    return null;
  }

  // Show loader only on initial load for protected routes
  if (!isPublic && !user && token) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-white/20" size={48} />
        <p className="text-white/20 text-xs font-black uppercase tracking-[0.5em]">Verifying Identity Protocol</p>
      </div>
    );
  }

  return <>{children}</>;
}

