
"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'rol' | 'estado'> & { contrasena: string }) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [token, setToken] = useLocalStorage<string | null>('access_token', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && token) {
      setIsAuthenticated(true);
      setIsAdmin(user.rol.nombre === 'ADMINISTRADOR');
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, [user, token]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const LOGIN_MUTATION = `
      mutation UserLogin($loginInput: LoginInput!) {
        login(loginInput: $loginInput) {
          access_token
          user {
            cedula
            nombre
            apellido
            email
            telefono
            direccionPrincipal
            rol {
              id
              nombre
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        '/graphql', 
        {
          query: LOGIN_MUTATION,
          variables: {
            loginInput: { email, password: pass },
          },
        }
      );

      const apiData = response.data.data;

      if (apiData?.login) {
        const { access_token, user: apiUser } = apiData.login;
        setToken(access_token);
        setUser(apiUser);
        
        if (apiUser.rol.nombre === 'ADMINISTRADOR') {
          router.push('/admin/orders');
        } else {
          router.push('/');
        }
        return true;
      } else {
        console.error("GraphQL login error:", response.data.errors);
        return false;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const register = async (userData: Omit<User, 'rol' | 'estado' | 'direccionPrincipal' | 'cedula' | 'telefono'> & { contrasena: string, direccion_principal: string, cedula: string, telefono: string }): Promise<boolean> => {
    const CREATE_USER_MUTATION = `
      mutation RegisterUser($createUsuarioInput: CreateUsuarioInput!) {
        register(createUsuarioInput: $createUsuarioInput) {
          cedula
          email
          nombre
          rol {
            nombre
          }
        }
      }
    `;
  
    try {
      const response = await axios.post('/graphql', {
        query: CREATE_USER_MUTATION,
        variables: {
          createUsuarioInput: {
            cedula: userData.cedula,
            nombre: userData.nombre,
            apellido: userData.apellido,
            telefono: userData.telefono,
            email: userData.email,
            password: userData.contrasena,
            direccionPrincipal: userData.direccion_principal,
            rolId: 2, // Hardcoded to 2 for CLIENTE
          },
        },
      });
  
      const apiData = response.data;
  
      if (apiData.errors) {
        console.error("GraphQL registration error:", apiData.errors);
        return false;
      } else if (apiData.data?.register) {
        router.push('/login');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return false;
    }
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
