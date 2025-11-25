// src/routes/app.routes.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dashboard } from '../screens/Dashboard';

const Stack = createNativeStackNavigator();

export function AppRoutes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ title: 'Agendamentos' }}
      />
    </Stack.Navigator>
  );
}
