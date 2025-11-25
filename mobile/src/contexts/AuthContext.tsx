// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setApiToken } from '../services/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const [[, token], [, userJson]] = await AsyncStorage.multiGet([
          '@barber:token',
          '@barber:user',
        ]);

        if (token && userJson) {
          setApiToken(token);
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.log('Erro carregando auth do storage', error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    const response = await api.post('/api/auth/login', { email, password });

    const data = response.data;
    console.log('Login response data:', data);

    // tenta achar o token em campos comuns
    const token: string | null =
      data.token ??
      data.accessToken ??
      data.jwt ??
      null;

    // tenta achar o user em data.user, ou monta a partir de campos soltos
    const user: AuthUser =
      data.user ?? {
        id: data.id,
        name: data.name,
        email: data.email,
      };

    const storagePairs: [string, string][] = [];

    if (token) {
      storagePairs.push(['@barber:token', token]);
      setApiToken(token);
    } else {
      console.warn('⚠️ Nenhum token encontrado na resposta de login.');
      setApiToken(null);
    }

    if (user) {
      storagePairs.push(['@barber:user', JSON.stringify(user)]);
      setUser(user);
    }

    if (storagePairs.length > 0) {
      await AsyncStorage.multiSet(storagePairs);
    }
  }

  async function signOut() {
    await AsyncStorage.multiRemove(['@barber:token', '@barber:user']);
    setApiToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
