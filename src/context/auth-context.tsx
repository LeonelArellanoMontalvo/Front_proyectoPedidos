"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { usuarios } from '@/lib/mock-data';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'rol_id' | 'estado' | 'contrasena_hash'> & { contrasena: string }) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      setIsAdmin(user.rol_id === 2); // 2 is ADMIN
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const foundUser = usuarios.find(u => u.email === email && u.contrasena_hash === pass);
    if (foundUser && foundUser.estado === 'ACTIVO') {
      setUser(foundUser);
      if (foundUser.rol_id === 2) {
        router.push('/admin/orders');
      } else {
        router.push('/');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const register = async (userData: Omit<User, 'rol_id' | 'estado' | 'contrasena_hash'> & { contrasena: string }): Promise<boolean> => {
    const existingUser = usuarios.find(u => u.email === userData.email || u.cedula === userData.cedula);
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      ...userData,
      rol_id: 1, // CLIENTE
      estado: 'ACTIVO',
      contrasena_hash: userData.contrasena, // Should be hashed
    };
    
    // In a real app, this would be an API call
    usuarios.push(newUser); 
    setUser(newUser);
    router.push('/');
    return true;
  };

  const value = { user, login, logout, register, isAuthenticated, isAdmin };

  return (
    <AuthContext.Provider value={value}>
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
