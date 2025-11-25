// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { Routes } from './src/routes';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <Routes />
    </AuthProvider>
  );
}
