import React, { createContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { MockDB } from '../services/mockDatabase';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('uni_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email: string) => {
    try {
      const user = await MockDB.login(email);
      setUser(user);
      localStorage.setItem('uni_user', JSON.stringify(user));
    } catch (e) {
      alert('Login failed: User not found');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uni_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};