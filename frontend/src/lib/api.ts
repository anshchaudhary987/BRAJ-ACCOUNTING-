import axios from 'axios';
import { useCompanyStore } from '@/store/useCompanyStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

// Request interceptor to attach company ID
api.interceptors.request.use((config) => {
  // We use the store's state directly for the interceptor
  // Note: Since this is outside of React components, we use the non-hook version of state access
  const company = useCompanyStore.getState().selectedCompany;
  
  if (company?.id) {
    config.headers['x-company-id'] = company.id;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors like 401, 403, 500
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
