'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi, registerApi, getMeApi } from '../lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('vocal_separator_auth_token');
    if (storedToken) {
      setToken(storedToken);
      getMeApi(storedToken)
        .then((res) => {
          if (res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('vocal_separator_auth_token');
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('vocal_separator_auth_token');
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (emailOrUsername: string, password: string) => {
    const res = await loginApi(emailOrUsername, password);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('vocal_separator_auth_token', res.token);
      setIsAuthModalOpen(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await registerApi(username, email, password);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('vocal_separator_auth_token', res.token);
      setIsAuthModalOpen(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vocal_separator_auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
