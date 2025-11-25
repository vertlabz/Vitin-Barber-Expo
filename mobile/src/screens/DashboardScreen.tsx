// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

type DashboardScreenProps = {
  onLogout: () => void;
  onSchedule: () => void;
};

type Appointment = {
  id: string;
  date: string;
  notes?: string | null;
  service?: {
    id: string;
    name: string;
    duration?: number;
    price?: number;
  };
  provider?: {
    id: string;
    name: string;
  };
};

export function DashboardScreen({ onLogout, onSchedule }: DashboardScreenProps) {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      setLoadingAppointments(true);

      const res = await api.get('/api/appointments');

      console.log('Appointments response:', JSON.stringify(res.data, null, 2));

      let list: Appointment[] = [];

      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data.appointments)) {
        list = res.data.appointments;
      }

      setAppointments(list);
    } catch (error: any) {
      console.log('Erro carregando agendamentos:', error?.response?.data || error);
    } finally {
      setLoadingAppointments(false);
    }
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  function renderAppointment({ item }: { item: Appointment }) {
    const serviceName = item.service?.name ?? 'Serviço';
    const providerName = item.provider?.name ?? 'Barbeiro';
    const when = formatDateTime(item.date);

    return (
      <View style={styles.appointmentCard}>
        <Text style={styles.appointmentService}>{serviceName}</Text>
        <Text style={styles.appointmentWhen}>{when}</Text>
        <Text style={styles.appointmentProvider}>com {providerName}</Text>
        {item.notes ? (
          <Text style={styles.appointmentNotes}>Obs: {item.notes}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header básico */}
      <Text style={styles.greeting}>Olá 👋</Text>
      <Text style={styles.name}>{user?.name ?? 'Cliente'}</Text>

      {/* Card principal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>O que você quer fazer hoje?</Text>
        <Text style={styles.cardSubtitle}>
          Agende um horário ou veja seus próximos atendimentos.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={onSchedule}>
          <Text style={styles.primaryButtonText}>Agendar serviço</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de agendamentos */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Meus agendamentos</Text>
        <TouchableOpacity onPress={loadAppointments}>
          <Text style={styles.sectionAction}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {loadingAppointments ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Carregando seus horários...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <Text style={styles.emptyText}>
          Você ainda não tem agendamentos. Que tal marcar um agora? ✂️
        </Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={renderAppointment}
        />
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={onLogout}>
        <Text style={styles.secondaryButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

// estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#0f172a', // fundo escuro
  },
  greeting: {
    fontSize: 20,
    color: '#9ca3af',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#022c22',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionAction: {
    color: '#60a5fa',
    fontSize: 13,
  },
  loadingBox: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 13,
  },
  emptyText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 14,
  },
  appointmentCard: {
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  appointmentService: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentWhen: {
    color: '#e5e7eb',
    fontSize: 13,
    marginBottom: 2,
  },
  appointmentProvider: {
    color: '#9ca3af',
    fontSize: 12,
  },
  appointmentNotes: {
    marginTop: 4,
    color: '#9ca3af',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
