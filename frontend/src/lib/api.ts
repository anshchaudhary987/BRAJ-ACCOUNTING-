import axios from 'axios';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

// Request interceptor to attach company ID and JWT token
api.interceptors.request.use((config) => {
  const company = useCompanyStore.getState().selectedCompany;
  const token = useAuthStore.getState().token;
  
  if (company?.id) {
    config.headers['x-company-id'] = company.id;
  }
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (Auth token issues)
    if (error.response?.status === 401) {
      const isAuthRoute = error.config.url?.includes('/auth/login') || 
                         error.config.url?.includes('/auth/signup') ||
                         error.config.url?.includes('/auth/me');
      
      if (!isAuthRoute) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && 
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      }
    }

    // Handle 403 Forbidden (Company access issues)
    if (error.response?.status === 403) {
      const message = error.response?.data?.error || error.response?.data?.message || '';
      if (message.includes('access to this company') || message.includes('Company context required')) {
        console.warn('Access denied to company. Redirecting to setup.');
        useCompanyStore.getState().setSelectedCompany(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/company/setup') {
          window.location.href = '/company/setup';
        }
      }
    }
    // Handle 404 Not Found (Specifically for Company not found)
    if (error.response?.status === 404) {
      const message = error.response?.data?.error || error.response?.data?.message || '';
      if (message.includes('Company not found')) {
        console.warn('Current company not found on server. Resetting selection.');
        useCompanyStore.getState().setSelectedCompany(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/company/setup') {
          window.location.href = '/company/setup';
        }
      }
    }
    
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
