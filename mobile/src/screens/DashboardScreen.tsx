// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { User } from '../../App';

type DashboardScreenProps = {
  user: User;
  onLogout: () => void;
};

export function DashboardScreen({ user, onLogout }: DashboardScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.label}>Olá, {user.name}</Text>

      <TouchableOpacity style={styles.button} onPress={onLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: 120,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
