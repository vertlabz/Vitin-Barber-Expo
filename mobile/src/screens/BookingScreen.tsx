// src/screens/BookingScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { api } from '../services/api';

type BookingScreenProps = {
  onBack: () => void;
};

type Service = {
  id: string;
  name: string;
  duration: number;
  price?: number;
};

const DEFAULT_PROVIDER_ID = '2b4bb72b-c961-4f05-beb8-013dd39a5a07';

export function BookingScreen({ onBack }: BookingScreenProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [hasTriedSlots, setHasTriedSlots] = useState(false);

  useEffect(() => {
    loadProviderDetails(DEFAULT_PROVIDER_ID);
  }, []);

  async function loadProviderDetails(providerId: string) {
    try {
      const res = await api.get(`/api/providers/${providerId}`);
      const data = res.data;

      console.log('Provider details:', JSON.stringify(data, null, 2));

      const provider = data.provider ?? data;

      const servicesFromApi: Service[] =
        provider.services ?? provider.providerServices ?? [];

      setServices(servicesFromApi);

      if (servicesFromApi.length > 0) {
        setSelectedServiceId(servicesFromApi[0].id);
      }
    } catch (error: any) {
      console.log(
        'Erro carregando serviços:',
        error?.response?.data || error,
      );
      Alert.alert('Erro', 'Não foi possível carregar os serviços.');
    }
  }

  async function loadSlots() {
    if (!selectedServiceId) {
      Alert.alert('Atenção', 'Selecione um serviço.');
      return;
    }

    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setHasTriedSlots(true);

      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD

      const res = await api.get('/api/appointments/slots', {
        params: {
          providerId: DEFAULT_PROVIDER_ID,
          date: formattedDate,
          serviceId: selectedServiceId,
        },
      });

      console.log(
        'Slots response:',
        JSON.stringify(res.data, null, 2),
      );

      let slotsFromApi: string[] = [];

      if (Array.isArray(res.data)) {
        // caso a API retorne diretamente ["2025-11-27T13:00:00Z", ...]
        slotsFromApi = res.data;
      } else if (Array.isArray(res.data.slots)) {
        // caso a API retorne { slots: [ ... ] }
        slotsFromApi = res.data.slots;
      } else if (
        res.data.slots &&
        Array.isArray(res.data.slots.slots)
      ) {
        // caso muito bizarro { slots: { slots: [...] } }
        slotsFromApi = res.data.slots.slots;
      }

      setSlots(slotsFromApi);

      if (slotsFromApi.length === 0) {
        // não é erro, só não tem horário
        console.log('Nenhum horário disponível para esta data.');
      }
    } catch (error: any) {
      console.log('Erro carregando slots:', error?.response?.data || error);
      Alert.alert(
        'Erro',
        error?.response?.data?.message ||
          'Não foi possível carregar horários disponíveis.',
      );
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSchedule() {
    if (!selectedServiceId || !selectedSlot) {
      Alert.alert('Erro', 'Selecione serviço e horário.');
      return;
    }

    try {
      await api.post('/api/appointments', {
        providerId: DEFAULT_PROVIDER_ID,
        serviceId: selectedServiceId,
        date: selectedSlot,
        notes: '',
      });

      Alert.alert('Sucesso', 'Agendamento confirmado ✅');
      onBack();
    } catch (error: any) {
      console.log('Erro criando agendamento:', error?.response?.data || error);
      Alert.alert(
        'Erro',
        error?.response?.data?.message ||
          'Não foi possível criar o agendamento.',
      );
    }
  }

  function handleChangeDate(_: DateTimePickerEvent, selected?: Date) {
    setShowPicker(false);
    if (selected) {
      setDate(selected);
      setSlots([]);
      setSelectedSlot(null);
      setHasTriedSlots(false);
    }
  }

  function formatHour(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo agendamento</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Serviços em LISTA */}
        <Text style={styles.sectionTitle}>Escolha o serviço</Text>

        {services.length === 0 && (
          <Text style={styles.emptyText}>
            Nenhum serviço cadastrado para este barbeiro.
          </Text>
        )}

        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const selected = selectedServiceId === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.serviceRow,
                  selected && styles.serviceRowSelected,
                ]}
                onPress={() => {
                  setSelectedServiceId(item.id);
                  setSlots([]);
                  setSelectedSlot(null);
                  setHasTriedSlots(false);
                }}
              >
                <View style={styles.serviceInfo}>
                  <Text
                    style={[
                      styles.serviceName,
                      selected && styles.serviceNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.serviceMeta}>
                    {item.duration} min
                    {typeof item.price === 'number'
                      ? ` • R$ ${item.price}`
                      : ''}
                  </Text>
                </View>
                <View
                  style={[
                    styles.serviceSelector,
                    selected && styles.serviceSelectorSelected,
                  ]}
                />
              </TouchableOpacity>
            );
          }}
        />

        {/* Data */}
        <Text style={styles.sectionTitle}>Escolha a data</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {date.toLocaleDateString('pt-BR')}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default" // seguro no iOS e Android
            onChange={handleChangeDate}
          />
        )}

        {/* Buscar horários */}
        <TouchableOpacity style={styles.loadButton} onPress={loadSlots}>
          <Text style={styles.loadButtonText}>
            {loadingSlots ? 'Carregando...' : 'Ver horários disponíveis'}
          </Text>
        </TouchableOpacity>

        {/* Slots */}
        {slots.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Horários disponíveis</Text>
            <FlatList
              data={slots}
              keyExtractor={(item) => item}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              scrollEnabled={false}
              style={{ marginTop: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.slot,
                    selectedSlot === item && styles.slotSelected,
                  ]}
                  onPress={() => setSelectedSlot(item)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot === item && styles.slotTextSelected,
                    ]}
                  >
                    {formatHour(item)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* Mensagem quando não tem horário depois de tentar carregar */}
        {hasTriedSlots && !loadingSlots && slots.length === 0 && (
          <Text style={styles.emptyText}>
            Nenhum horário disponível para essa data. Tente outro dia. 😢
          </Text>
        )}

        {/* Confirmar */}
        {selectedSlot && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleSchedule}
          >
            <Text style={styles.confirmText}>Confirmar agendamento ✅</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  backText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  headerTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  serviceRowSelected: {
    borderColor: '#22c55e',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  serviceNameSelected: {
    color: '#bbf7d0',
  },
  serviceMeta: {
    color: '#9ca3af',
    fontSize: 12,
  },
  serviceSelector: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  serviceSelectorSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e',
  },
  dateButton: {
    marginTop: 4,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  dateButtonText: {
    color: '#e5e7eb',
    fontSize: 15,
  },
  loadButton: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadButtonText: {
    color: '#f9fafb',
    fontWeight: '600',
  },
  slot: {
    marginTop: 8,
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  slotSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  slotText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  slotTextSelected: {
    color: '#022c22',
    fontWeight: '600',
  },
  confirmButton: {
    marginTop: 18,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  confirmText: {
    color: '#022c22',
    fontSize: 16,
    fontWeight: '700',
  },
});
