// src/routes/auth.routes.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignIn } from '../screens/SignIn';
import { Register } from '../screens/RegisterScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthRoutes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{ title: 'Entrar' }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ title: 'Criar conta' }}
      />
    </Stack.Navigator>
  );
}
