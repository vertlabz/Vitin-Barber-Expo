// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

type LoginScreenProps = {
  onGoToRegister: () => void;
};

export function LoginScreen({ onGoToRegister }: LoginScreenProps) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn({ email, password });
      // AppInner cuida de ir pra Dashboard
    } catch (error: any) {
      console.log('Erro ao entrar:', error?.response?.data || error);
      Alert.alert(
        'Erro ao entrar',
        error?.response?.data?.message || 'Verifique suas credenciais.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Vitinho Barber</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Acesse sua conta para agendar seus horários.
        </Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="******"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={onGoToRegister}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>
            Não tem conta? <Text style={styles.linkTextHighlight}>Registrar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#020617',
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#020617',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#e5e7eb',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f9fafb',
    backgroundColor: '#020617',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#022c22',
    fontWeight: '700',
    fontSize: 15,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  linkTextHighlight: {
    color: '#60a5fa',
    fontWeight: '500',
  },
});
