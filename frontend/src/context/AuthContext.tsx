import React, { createContext, useContext, useState, ReactNode } from 'react';

import { getEmailFromToken } from '../utils/jwt';

export interface AuthContextType {
  user: any;
  token: string | null;
  userEmail: string;
  login: (user: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string>('');

  // On mount, clear invalid token
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Try to decode or validate token (simple check: length, format, etc.)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload || !payload.exp || Date.now() / 1000 > payload.exp) {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      }
    }
  }, []);

  React.useEffect(() => {
    if (token) setUserEmail(getEmailFromToken(token));
    else setUserEmail('');
  }, [token]);

  const login = (user: any, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    setUserEmail(getEmailFromToken(token));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setUserEmail('');
  };

  return (
    <AuthContext.Provider value={{ user, token, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
