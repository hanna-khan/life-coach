import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '../config/api.ts';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if running in developer mode
  const IS_DEVELOPER = process.env.REACT_APP_IS_DEVELOPER === 'true';

  // Set up axios defaults
  useEffect(() => {
    const baseURL = getApiBaseUrl();
    axios.defaults.baseURL = baseURL;
    console.log('[AuthContext] axios.defaults.baseURL set to', baseURL, '| hostname:', typeof window !== 'undefined' ? window.location.hostname : 'n/a');

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (IS_DEVELOPER) {
        // In developer mode, automatically set admin user
        setUser({
          id: 'dev-user-id',
          name: 'Developer User',
          email: 'dev@lifecoach.com',
          role: 'admin'
        });
        setToken('dev-token');
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          if (response.data.success && response.data.user) {
            console.log('Auth check user data:', response.data.user); // Debug log
            setUser(response.data.user);
          } else {
            console.error('Invalid response from /api/auth/me:', response.data);
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, IS_DEVELOPER]);

  const login = async (email: string, password: string) => {
    try {
      if (IS_DEVELOPER) {
        // In developer mode, always succeed
        setUser({
          id: 'dev-user-id',
          name: 'Developer User',
          email: 'dev@lifecoach.com',
          role: 'admin'
        });
        setToken('dev-token');
        toast.success('Developer mode: Login successful!');
        return;
      }

      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      console.log('Login response user data:', userData); // Debug log
      console.log('User role:', userData?.role); // Debug log
      console.log('Is admin?', userData?.role === 'admin'); // Debug log
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      if (IS_DEVELOPER) {
        // In developer mode, always succeed
        setUser({
          id: 'dev-user-id',
          name: 'Developer User',
          email: 'dev@lifecoach.com',
          role: 'admin'
        });
        setToken('dev-token');
        toast.success('Developer mode: Registration successful!');
        return;
      }

      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      toast.success('Registration successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const isAdminValue = user?.role === 'admin';
  
  // Debug log
  if (user) {
    console.log('AuthContext - User:', user);
    console.log('AuthContext - User role:', user.role);
    console.log('AuthContext - Is Admin:', isAdminValue);
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: isAdminValue
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
