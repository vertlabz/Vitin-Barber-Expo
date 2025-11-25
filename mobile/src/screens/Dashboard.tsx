// src/screens/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

type Provider = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    api.get('/providers').then(response => {
      setProviders(response.data);
    }).catch(err => {
      console.log(err.response?.data || err);
    });
  }, []);

  function handleCreateAppointment(providerId: string) {
    // Aqui você poderia navegar pra uma tela de seleção de data/horário
    // Ou fazer um POST direto para testes
  }

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>
        Olá, {user?.name}
      </Text>

      <Button title="Sair" onPress={signOut} />

      <Text style={{ marginTop: 24, fontSize: 16, marginBottom: 8 }}>
        Barbeiros:
      </Text>

      <FlatList
        data={providers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 12,
              borderWidth: 1,
              borderRadius: 8,
              marginBottom: 8,
            }}
            onPress={() => handleCreateAppointment(item.id)}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
