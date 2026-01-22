// src/screens/BookingScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import { api } from '../services/api';
import type { AppService } from '../../App';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Container } from '../components/layout/Container';
import { ResponsiveStack } from '../components/layout/ResponsiveStack';

type BookingScreenProps = {
  onBack: () => void;
  service: AppService;
};

type ProviderAvailability = {
  weekday: number; // 0 = domingo ... 6 = sábado
};

const DEFAULT_PROVIDER_ID = '773ab6bb-d178-4ad4-a450-1708f6c9a399';
const MAX_BOOKING_DAYS = 7;

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function BookingScreen({ onBack, service }: BookingScreenProps) {
  const { isDesktop } = useBreakpoint();
  const [date, setDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0],
  );

  const touchDebugEnabled = __DEV__ && Platform.OS === 'web';
  const [availableWeekdays, setAvailableWeekdays] = useState<number[]>([]);

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

      console.log('Provider details (booking):', JSON.stringify(data, null, 2));

      const provider = data.provider ?? data;

      const avails: ProviderAvailability[] =
        provider.providerAvailabilities ?? [];
      const weekdays = avails.map((a) => a.weekday);
      setAvailableWeekdays(weekdays);
    } catch (error: any) {
      console.log(
        'Erro carregando provider:',
        error?.response?.data || error,
      );
      Alert.alert('Erro', 'Não foi possível carregar informações do barbeiro.');
    }
  }

  function isDayEnabled(dateString: string) {
    const d = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = d.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > MAX_BOOKING_DAYS) {
      return false;
    }

    const weekday = d.getDay(); // 0..6
    return availableWeekdays.includes(weekday);
  }

  function handleSelectDay(dateString: string) {
    if (!isDayEnabled(dateString)) return;

    const newDate = new Date(dateString + 'T00:00:00');
    setDate(newDate);
    setSelectedDateStr(dateString);
    setSlots([]);
    setSelectedSlot(null);
    setHasTriedSlots(false);
  }

  function handleDebugHitTest(
    label: string,
    event: GestureResponderEvent,
  ) {
    if (!touchDebugEnabled) return;

    const nativeEvent = event.nativeEvent as any;
    const touch =
      nativeEvent?.touches?.[0] ??
      nativeEvent?.changedTouches?.[0] ??
      nativeEvent;
    const pageX = touch?.pageX ?? nativeEvent?.pageX;
    const pageY = touch?.pageY ?? nativeEvent?.pageY;
    const clientX = touch?.clientX ?? nativeEvent?.clientX ?? pageX;
    const clientY = touch?.clientY ?? nativeEvent?.clientY ?? pageY;

    console.log('[touch-debug]', label, { pageX, pageY, clientX, clientY });

    if (
      typeof document !== 'undefined' &&
      typeof clientX === 'number' &&
      typeof clientY === 'number'
    ) {
      const el = document.elementFromPoint(clientX, clientY);
      console.log(
        '[hit]',
        el?.tagName,
        el?.className,
        el?.id,
      );
    }
  }

  function handleCalendarArrowPress(
    label: 'calendar-arrow-left' | 'calendar-arrow-right',
    updateMonth: () => void,
  ) {
    if (touchDebugEnabled) {
      console.log('[touch-debug]', label);
    }
    updateMonth();
  }

  function handleDayPress(dateString: string) {
    if (touchDebugEnabled) {
      console.log('[touch-debug] calendar-day-press', dateString);
    }
    handleSelectDay(dateString);
  }

  function handleLoadSlotsPress() {
    if (touchDebugEnabled) {
      console.log('[touch-debug] load-slots-press');
    }
    loadSlots();
  }

  const touchDebugHandlers = touchDebugEnabled
    ? {
        onTouchStartCapture: (event: GestureResponderEvent) =>
          handleDebugHitTest('booking-container-touch-start', event),
        onStartShouldSetResponderCapture: (
          event: GestureResponderEvent,
        ) => {
          handleDebugHitTest('booking-container-should-set', event);
          return false;
        },
      }
    : {};

  async function loadSlots() {
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setHasTriedSlots(true);

      const formattedDate = selectedDateStr;

      const res = await api.get('/api/appointments/slots', {
        params: {
          providerId: DEFAULT_PROVIDER_ID,
          date: formattedDate,
          serviceId: service.id,
        },
      });

      console.log('Slots response:', JSON.stringify(res.data, null, 2));

      let slotsFromApi: string[] = [];

      if (Array.isArray(res.data)) {
        slotsFromApi = res.data;
      } else if (Array.isArray(res.data.slots)) {
        slotsFromApi = res.data.slots;
      } else if (
        res.data.slots &&
        Array.isArray(res.data.slots.slots)
      ) {
        slotsFromApi = res.data.slots.slots;
      }

      setSlots(slotsFromApi);
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
    if (!selectedSlot) {
      Alert.alert('Erro', 'Selecione um horário.');
      return;
    }

    try {
      await api.post('/api/appointments', {
        providerId: DEFAULT_PROVIDER_ID,
        serviceId: service.id,
        date: selectedSlot,
        notes: '',
      });

      Alert.alert('Sucesso', 'Agendamento confirmado ✅');
      onBack();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      console.log('Erro criando agendamento:', error?.response?.data || error);

      if (
        backendMessage &&
        backendMessage.toLowerCase().includes('já existe')
      ) {
        Alert.alert(
          'Horário indisponível',
          'Esse horário acabou de ser ocupado. Vamos atualizar a lista.',
        );
        await loadSlots();
        return;
      }

      Alert.alert(
        'Erro',
        backendMessage || 'Não foi possível criar o agendamento.',
      );
    }
  }

  function formatHour(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const slotColumns = isDesktop ? 4 : 3;

  return (
    <View style={styles.container} {...touchDebugHandlers}>
      {/* Header */}
      <Container style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo agendamento</Text>
          <View style={{ width: 60 }} />
        </View>
      </Container>

      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
        ]}
      >
        <Container>
          {/* Serviço selecionado */}
          <View style={styles.serviceInfoCard}>
            <Text style={styles.serviceInfoLabel}>Serviço selecionado</Text>
            <Text style={styles.serviceInfoName}>{service.name}</Text>
            <Text style={styles.serviceInfoMeta}>
              {service.duration} min
              {typeof service.price === 'number'
                ? ` • R$ ${service.price}`
                : ''}
            </Text>
          </View>

          <ResponsiveStack style={styles.bookingColumns} spacing={32}>
            <View style={styles.calendarColumn}>
              {/* Calendário customizado */}
              <Text style={styles.sectionTitle}>Escolha a data</Text>

              <View style={styles.calendarWrapper} pointerEvents="auto">
                <Calendar
                  firstDay={1}
                  hideExtraDays
                  enableSwipeMonths={Platform.OS !== 'web'}
                  onDayPress={(day: DateObject) => {
                    if (touchDebugEnabled) {
                      console.log(
                        '[touch-debug] calendar-onDayPress',
                        day.dateString,
                      );
                    }
                    handleSelectDay(day.dateString);
                  }}
                  onPressArrowLeft={(subtractMonth) =>
                    handleCalendarArrowPress(
                      'calendar-arrow-left',
                      subtractMonth,
                    )
                  }
                  onPressArrowRight={(addMonth) =>
                    handleCalendarArrowPress(
                      'calendar-arrow-right',
                      addMonth,
                    )
                  }
                  dayComponent={({ date: d }) => {
                    if (!d) return null;
                    const enabled = isDayEnabled(d.dateString);
                    const isSelected = d.dateString === selectedDateStr;

                    const bgColor = isSelected
                      ? '#22c55e'
                      : enabled
                      ? '#0f172a'
                      : 'transparent';

                    const borderColor = enabled ? '#1f2937' : 'transparent';

                    const textColor = !enabled
                      ? '#4b5563'
                      : isSelected
                      ? '#022c22'
                      : '#e5e7eb';

                    const inner = (
                      <View
                        style={[
                          styles.dayContainer,
                          { backgroundColor: bgColor, borderColor },
                        ]}
                      >
                        <Text style={[styles.dayText, { color: textColor }]}>
                          {d.day}
                        </Text>
                      </View>
                    );

                    if (!enabled) {
                      return inner;
                    }

                    return (
                      <Pressable
                        onPress={() => handleDayPress(d.dateString)}
                        pointerEvents="auto"
                        style={styles.dayPressable}
                        onTouchStart={(event) =>
                          handleDebugHitTest(
                            'calendar-day-touch-start',
                            event,
                          )
                        }
                      >
                        {inner}
                      </Pressable>
                    );
                  }}
                  renderHeader={(d) => {
                    const month = monthNames[d.getMonth()];
                    const year = d.getFullYear();
                    return (
                      <Text style={styles.calendarHeader}>
                        {month} {year}
                      </Text>
                    );
                  }}
                  theme={{
                    backgroundColor: '#020617',
                    calendarBackground: '#020617',
                    arrowColor: '#e5e7eb',
                    monthTextColor: '#e5e7eb',
                    textSectionTitleColor: '#6b7280',
                  }}
                />
              </View>

              {/* Botão carregar horários */}
              <TouchableOpacity
                style={styles.loadButton}
                onPress={handleLoadSlotsPress}
                pointerEvents="auto"
                onTouchStart={(event) =>
                  handleDebugHitTest('load-slots-touch-start', event)
                }
              >
                <Text style={styles.loadButtonText}>
                  {loadingSlots
                    ? 'Carregando...'
                    : 'Ver horários disponíveis'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.slotsColumn}>
              {/* Slots */}
              {slots.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Horários disponíveis</Text>
                  <FlatList
                    data={slots}
                    keyExtractor={(item) => item}
                    numColumns={slotColumns}
                    columnWrapperStyle={
                      slotColumns > 1
                        ? styles.slotRow
                        : undefined
                    }
                    scrollEnabled={false}
                    style={{ marginTop: 12 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.slot,
                          selectedSlot === item && styles.slotSelected,
                        ]}
                        onPress={() => {
                          if (touchDebugEnabled) {
                            console.log(
                              '[touch-debug] slot-press',
                              item,
                            );
                          }
                          setSelectedSlot(item);
                        }}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            selectedSlot === item &&
                              styles.slotTextSelected,
                          ]}
                        >
                          {formatHour(item)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}

              {/* Mensagem sem horário */}
              {hasTriedSlots && !loadingSlots && slots.length === 0 && (
                <Text style={styles.emptyText}>
                  Nenhum horário disponível para essa data. Tente outro dia.
                  😢
                </Text>
              )}

              {/* Confirmar */}
              {selectedSlot && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleSchedule}
                >
                  <Text style={styles.confirmText}>
                    Confirmar agendamento ✅
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ResponsiveStack>
        </Container>
      </ScrollView>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  headerContainer: {
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  scrollContentDesktop: {
    paddingBottom: 32,
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

  // Serviço selecionado
  serviceInfoCard: {
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  bookingColumns: {
    marginTop: 16,
  },
  calendarColumn: {
    flex: 1,
    width: '100%',
  },
  slotsColumn: {
    flex: 1,
    width: '100%',
  },
  serviceInfoLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  serviceInfoName: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  serviceInfoMeta: {
    color: '#9ca3af',
    fontSize: 13,
  },

  // Calendário
  calendarWrapper: {
    borderRadius: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
    ...(Platform.OS === 'web' ? {} : { overflow: 'hidden' }),
    position: 'relative',
    zIndex: 10,
  },
  calendarHeader: {
    textAlign: 'center',
    paddingVertical: 8,
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
  },
  dayContainer: {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginVertical: 4,
    alignSelf: 'center',
    zIndex: 2,
  },
  dayText: {
    fontSize: 14,
  },
  dayPressable: {
    alignSelf: 'center',
    zIndex: 3,
    position: 'relative',
  },

  loadButton: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
    zIndex: 20,
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
  slotRow: {
    justifyContent: 'space-between',
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
