// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setApiToken } from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
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

    const { token, user } = response.data;

    await AsyncStorage.multiSet([
      ['@barber:token', token],
      ['@barber:user', JSON.stringify(user)],
    ]);

    setApiToken(token);
    setUser(user);
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
        loading,
        isAuthenticated: !!user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
