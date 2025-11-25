// src/screens/SignIn.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('teste@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    try {
      setLoading(true);
      await signIn({ email, password });
    } catch (error: any) {
      console.log(error?.response?.data || error);
      Alert.alert(
        'Erro ao entrar',
        error?.response?.data?.message || 'Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />

      <Text>Senha</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 8, marginBottom: 24 }}
      />

      <Button title={loading ? 'Entrando...' : 'Entrar'} onPress={handleSignIn} />
    </View>
  );
}
