// App.tsx
import React, { useEffect, useState } from 'react';
import { View, StatusBar, ActivityIndicator } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuth } from './src/hooks/useAuth';

type Screen = 'login' | 'register' | 'dashboard';

function AppInner() {
  const { isAuthenticated, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>('login');

  // Quando o usuário já estiver autenticado ao abrir o app, vai direto pra Dashboard
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        setScreen('dashboard');
      } else {
        setScreen('login');
      }
    }
  }, [isAuthenticated, loading]);

  function handleLogout() {
    signOut();
    setScreen('login');
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />

      {screen === 'login' && (
        <LoginScreen onGoToRegister={() => setScreen('register')} />
      )}

      {screen === 'register' && (
        <RegisterScreen onGoBack={() => setScreen('login')} />
      )}

      {screen === 'dashboard' && <DashboardScreen onLogout={handleLogout} />}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
