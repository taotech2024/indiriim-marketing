import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sessionManager, User } from '../utils/sessionManager';
import * as authApi from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionManager.getSession();
    const token = sessionManager.getToken();
    if (session && token) {
      setUser(session.user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token, refreshToken: refreshTokenValue, user: userData } = await authApi.login(email, password);
      sessionManager.saveSession(userData, token, refreshTokenValue);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Giriş başarısız.');
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    const refreshTokenValue = sessionManager.getRefreshToken();
    if (refreshTokenValue) {
      authApi.logout(refreshTokenValue).catch(() => {});
    }
    sessionManager.clearSession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
