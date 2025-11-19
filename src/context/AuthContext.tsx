import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string, redirectUrl?: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if token is expired (24 hours)
  const isTokenExpired = (loginTime: number): boolean => {
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - loginTime) > hours24;
  };

  // Validate token with server
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const { valid } = await apiClient.verifyToken(token);
      return valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');

    if (!storedToken || !loginTime) {
      setIsAuthenticated(false);
      setToken(null);
      return false;
    }

    // Check if token is expired
    if (isTokenExpired(parseInt(loginTime))) {
      logout();
      return false;
    }

    // Validate token with server
    const isValid = await validateToken(storedToken);
    if (!isValid) {
      logout();
      return false;
    }

    setIsAuthenticated(true);
    setToken(storedToken);
    return true;
  };

  // Refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!token) return false;
      const data = await apiClient.refreshToken(token);

      if (data.token) {
        login(data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  // Login function
  const login = (newToken: string, redirectUrl?: string) => {
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminLoginTime', Date.now().toString());
    setToken(newToken);
    setIsAuthenticated(true);
    if (redirectUrl) {
      navigate(redirectUrl);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoginTime');
    setToken(null);
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Set up periodic token validation
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(async () => {
        const loginTime = localStorage.getItem('adminLoginTime');
        if (loginTime && isTokenExpired(parseInt(loginTime))) {
          logout();
        } else {
          await checkAuth();
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value: AuthContextType = {
    isAuthenticated,
    token,
    login,
    logout,
    checkAuth,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
