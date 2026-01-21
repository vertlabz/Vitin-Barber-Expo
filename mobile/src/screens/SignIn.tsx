// src/screens/SignIn.tsx
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../routes/auth.routes';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Container } from '../components/layout/Container';

type SignInNavProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export function SignIn() {
  const { signIn } = useAuth();
  const navigation = useNavigation<SignInNavProp>();
  const { isDesktop } = useBreakpoint();

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
    } catch (error: any) {
      console.log(error?.response?.data || error);
      Alert.alert(
        'Erro ao entrar',
        error?.response?.data?.message || 'Verifique suas credenciais.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoToRegister() {
    navigation.navigate('Register');
  }

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <Container maxWidth={420} style={styles.content}>
        <Text style={styles.title}>Entrar</Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="******"
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
          onPress={handleGoToRegister}
        >
          <Text style={styles.linkText}>Não tem conta? Registrar</Text>
        </TouchableOpacity>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  containerDesktop: {
    paddingTop: 0,
  },
  content: {
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
  },
});
