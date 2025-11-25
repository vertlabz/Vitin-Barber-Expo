// src/routes/app.routes.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dashboard } from '../screens/Dashboard';

export type AppStackParamList = {
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppRoutes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
}
