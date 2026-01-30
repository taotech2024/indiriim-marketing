import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sessionManager, User, UserRole } from '../utils/sessionManager';

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

const resolveRole = (email: string): UserRole => {
  const lower = email.toLowerCase();
  if (lower.includes('admin')) return 'ADMIN';
  if (lower.includes('owner')) return 'PROJECT_OWNER';
  if (lower.includes('manager')) return 'MARKETING_MANAGER';
  return 'MARKETING_STAFF';
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionManager.getSession();
    if (session) {
      setUser(session.user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const role = resolveRole(email);
      const mockUser: User = {
        id: 1,
        name: 'Notification Admin',
        email,
        role
      };
      sessionManager.saveSession(mockUser);
      setUser(mockUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionManager.clearSession();
    setUser(null);
    setIsAuthenticated(false);
  };

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
