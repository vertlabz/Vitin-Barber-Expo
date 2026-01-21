// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { api } from '../services/api';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Container } from '../components/layout/Container';

type RegisterScreenProps = {
  onGoBack: () => void;
};

export function RegisterScreen({ onGoBack }: RegisterScreenProps) {
  const { isDesktop } = useBreakpoint();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/api/auth/register', {
        name,
        email,
        password,
        isProvider: false,
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      onGoBack();
    } catch (error: any) {
      console.log('Erro ao registrar:', error?.response?.data || error);
      Alert.alert(
        'Erro ao registrar',
        error?.response?.data?.message || 'Não foi possível criar a conta.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <Container maxWidth={420} style={styles.content}>
        <Text style={styles.logo}>Vitinho Barber</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>
            Cadastre-se para começar a agendar seus horários.
          </Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
          />

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
            onPress={handleRegister}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={onGoBack}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>← Voltar para login</Text>
          </TouchableOpacity>
        </View>
      </Container>
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
  containerDesktop: {
    justifyContent: 'center',
    paddingTop: 0,
  },
  content: {
    paddingHorizontal: 0,
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
});
