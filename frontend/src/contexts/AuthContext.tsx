/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-useless-catch */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { userService, authService } from '../services/api.service';

interface User {
  user_id: string;
  email: string;
  name: string;
  role?: string;
  firstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      
      if (!token) {
        setLoading(false);
        return;
      }

      if (userData) {
        setUser(JSON.parse(userData));
        setLoading(false);
        return;
      }

      const response = await userService.getProfile();
      if (response.data) {
        localStorage.setItem('userData', JSON.stringify(response.data));
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data));
        setUser({
          user_id: response.data.user_id,
          email: response.data.email,
          name: response.data.full_name,
          role: response.data.role,
          firstLogin: response.data.first_login
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async() => {
    await authService.logout();
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};