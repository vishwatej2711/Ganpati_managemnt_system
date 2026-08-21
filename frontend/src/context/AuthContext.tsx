import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  businessName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, businessName: string, phone: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('ganpati_auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser({
        id: response.data._id,
        username: response.data.username,
        businessName: response.data.businessName,
        phone: response.data.phone,
      });
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('ganpati_auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('ganpati_auth_token', token);
      setUser(userData);
    } catch (error: any) {
      localStorage.removeItem('ganpati_auth_token');
      setUser(null);
      throw new Error(error.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, businessName: string, phone: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { username, password, businessName, phone });
      const { token, user: userData } = response.data;
      localStorage.setItem('ganpati_auth_token', token);
      setUser(userData);
    } catch (error: any) {
      localStorage.removeItem('ganpati_auth_token');
      setUser(null);
      throw new Error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ganpati_auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
