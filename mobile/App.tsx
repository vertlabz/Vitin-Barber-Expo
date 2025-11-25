// App.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuth } from './src/hooks/useAuth';

type Screen = 'login' | 'register' | 'dashboard' | 'booking';

export type AppService = {
  id: string;
  name: string;
  duration: number;
  price?: number;
};

function AppInner() {
  const { isAuthenticated, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>('login');
  const [selectedService, setSelectedService] = useState<AppService | null>(
    null,
  );

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) setScreen('dashboard');
      else setScreen('login');
    }
  }, [isAuthenticated, loading]);

  function handleLogout() {
    signOut();
    setScreen('login');
    setSelectedService(null);
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617',
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {screen === 'login' && (
        <LoginScreen onGoToRegister={() => setScreen('register')} />
      )}

      {screen === 'register' && (
        <RegisterScreen onGoBack={() => setScreen('login')} />
      )}

      {screen === 'dashboard' && (
        <DashboardScreen
          onLogout={handleLogout}
          onSchedule={(service) => {
            setSelectedService(service);
            setScreen('booking');
          }}
        />
      )}

      {screen === 'booking' && selectedService && (
        <BookingScreen
          onBack={() => setScreen('dashboard')}
          service={selectedService}
        />
      )}
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
