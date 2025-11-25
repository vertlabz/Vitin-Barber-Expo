// App.tsx
import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

export type User = {
  id: string;
  name: string;
  email: string;
};

type Screen = 'login' | 'register' | 'dashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);

  function handleLoginSuccess(loggedUser: User) {
    setUser(loggedUser);
    setScreen('dashboard');
  }

  function handleLogout() {
    setUser(null);
    setScreen('login');
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />

      {screen === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => setScreen('register')}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen onGoBack={() => setScreen('login')} />
      )}

      {screen === 'dashboard' && user && (
        <DashboardScreen user={user} onLogout={handleLogout} />
      )}
    </View>
  );
}
