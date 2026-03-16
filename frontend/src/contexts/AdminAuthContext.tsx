import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '../config/api.ts';

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

const getStoredToken = () => localStorage.getItem('adminToken');

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState(true);

  const baseURL = getApiBaseUrl();

  // Set baseURL and token on axios immediately (sync) so first requests have the token
  useEffect(() => {
    axios.defaults.baseURL = baseURL;
    console.log('[AdminAuthContext] axios.defaults.baseURL set to', baseURL);
    const t = token || getStoredToken();
    if (t) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, baseURL]);

  // Ensure every request to admin/API has the token (in case defaults weren't applied yet)
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const url = typeof config.url === 'string' ? config.url : '';
      const isAdminApi = url.includes('/api/admin') || url.includes('/api/bookings') || url.includes('/api/blogs/admin') || url.includes('/api/pricing/admin') || url.includes('/api/contact') || url.includes('/api/testimonials/admin') || url.includes('/api/payments/stats');
      if (isAdminApi) {
        const adminToken = getStoredToken();
        if (adminToken) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${adminToken}`;
          config.headers['x-auth-token'] = adminToken;
        }
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Check if admin is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/admin-auth/me');
          if (response.data.success && response.data.admin) {
            setAdmin(response.data.admin);
          } else {
            localStorage.removeItem('adminToken');
            setToken(null);
          }
        } catch (error: any) {
          console.error('Admin auth check failed:', error);
          if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/admin-auth/login', { email, password });
      const { token: newToken, admin: adminData } = response.data;
      
      setToken(newToken);
      setAdmin(adminData);
      localStorage.setItem('adminToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Admin login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const value: AdminAuthContextType = {
    admin,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!admin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

