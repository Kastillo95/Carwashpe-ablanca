import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ADMIN_PASSWORD } from '@/lib/constants';

interface AuthContextType {
  isAdminMode: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  validatePassword: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    // Check if admin mode was previously set
    const savedMode = localStorage.getItem('carwash-admin-mode');
    if (savedMode === 'true') {
      setIsAdminMode(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      localStorage.setItem('carwash-admin-mode', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminMode(false);
    localStorage.removeItem('carwash-admin-mode');
    // Redirect to dashboard when logging out of admin mode
    window.location.href = '/';
  };

  const validatePassword = (password: string): boolean => {
    return password === ADMIN_PASSWORD;
  };

  return (
    <AuthContext.Provider value={{ isAdminMode, login, logout, validatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
