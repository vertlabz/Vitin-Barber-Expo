// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setApiToken } from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem('@barber:token'),
          AsyncStorage.getItem('@barber:user'),
        ]);

        if (token && userJson) {
          setApiToken(token);
          setUser(JSON.parse(userJson));
        }
      } finally {
        setLoading(false);
      }
    }

    loadUserFromStorage();
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    const response = await api.post('/sessions', { email, password });

    const { token, user } = response.data;

    await AsyncStorage.setItem('@barber:token', token);
    await AsyncStorage.setItem('@barber:user', JSON.stringify(user));

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
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
