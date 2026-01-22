// src/screens/DashboardScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { AppService } from '../../App';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Container } from '../components/layout/Container';
import { ResponsiveStack } from '../components/layout/ResponsiveStack';
import { getTouchDebugProps } from '../utils/touchDebug';

type DashboardScreenProps = {
  onLogout: () => void;
  onSchedule: (service: AppService) => void;
};

type Appointment = {
  id: string;
  date: string;
  notes?: string | null;
  status?: string | null;
  endTime?: string | null;
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

type Service = AppService;

type TabKey = 'home' | 'appointments' | 'profile';

const DEFAULT_PROVIDER_ID = '773ab6bb-d178-4ad4-a450-1708f6c9a399';

export function DashboardScreen({ onLogout, onSchedule }: DashboardScreenProps) {
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('home');

  useEffect(() => {
    loadAppointments();
    loadServices();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
    }, []),
  );

  useEffect(() => {
    if (activeTab !== 'appointments') return;

    const intervalId = setInterval(() => {
      loadAppointments();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [activeTab]);

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

  async function loadServices() {
    try {
      setLoadingServices(true);

      const res = await api.get(`/api/providers/${DEFAULT_PROVIDER_ID}`);
      const data = res.data;
      const provider = data.provider ?? data;

      const servicesFromApi: Service[] =
        provider.services ?? provider.providerServices ?? [];

      setServices(servicesFromApi);
      if (!selectedService && servicesFromApi.length > 0) {
        setSelectedService(servicesFromApi[0]);
      }
    } catch (error: any) {
      console.log('Erro carregando serviços:', error?.response?.data || error);
    } finally {
      setLoadingServices(false);
    }
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  function getAppointmentEndTime(item: Appointment) {
    if (item.endTime) {
      return new Date(item.endTime);
    }

    if (item.service?.duration) {
      const startTime = new Date(item.date);
      return new Date(startTime.getTime() + item.service.duration * 60000);
    }

    return null;
  }

  function getStatusLabel(status?: string | null, item?: Appointment) {
    const normalized = status?.toUpperCase();

    if (normalized) {
      if (normalized === 'COMPLETED') return 'Concluído';
      if (normalized === 'SCHEDULED') return 'Não iniciado';
      if (normalized === 'CONFIRMED') return 'Confirmado';
      if (normalized === 'CANCELED') return 'Cancelado';
    }

    if (item) {
      const endTime = getAppointmentEndTime(item);
      if (endTime && Date.now() >= endTime.getTime()) {
        return 'Concluído';
      }
    }

    return 'Não iniciado';
  }

  const now = useMemo(() => Date.now(), [appointments]);

  function renderAppointment({ item }: { item: Appointment }) {
    const serviceName = item.service?.name ?? 'Serviço';
    const providerName = item.provider?.name ?? 'Barbeiro';
    const when = formatDateTime(item.date);
    const statusLabel = getStatusLabel(item.status, item);
    const endTime = getAppointmentEndTime(item);
    const isCompleted =
      endTime && now >= endTime.getTime()
        ? true
        : item.status?.toUpperCase() === 'COMPLETED';

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeaderRow}>
          <Text style={styles.appointmentService}>{serviceName}</Text>
          <View
            style={[
              styles.statusBadge,
              isCompleted && styles.statusBadgeCompleted,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isCompleted && styles.statusBadgeTextCompleted,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
        <Text style={styles.appointmentWhen}>{when}</Text>
        <Text style={styles.appointmentProvider}>com {providerName}</Text>
        {endTime ? (
          <Text style={styles.appointmentMeta}>
            Fim previsto: {formatDateTime(endTime.toISOString())}
          </Text>
        ) : null}
        {item.notes ? (
          <Text style={styles.appointmentNotes}>Obs: {item.notes}</Text>
        ) : null}
      </View>
    );
  }

  function renderService({ item }: { item: Service }) {
    const selected = selectedService?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.serviceCard,
          selected && styles.serviceCardSelected,
        ]}
        onPress={() => setSelectedService(item)}
        activeOpacity={0.8}
      >
        <View>
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
            {typeof item.price === 'number' ? ` • R$ ${item.price}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  function TabButton({
    label,
    tab,
  }: {
    label: string;
    tab: TabKey;
  }) {
    const active = activeTab === tab;
    return (
      <TouchableOpacity
        style={[styles.tabButton, active && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.tabButtonText, active && styles.tabButtonTextActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  function handlePressSchedule() {
    if (!selectedService) return;
    onSchedule(selectedService);
  }

  const showSidePanel = isDesktop && activeTab !== 'profile';
  const bannerOverlayPointerEvents = __DEV__ ? 'auto' : 'none';

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollContentDesktop : styles.scrollContentMobile,
        ]}
      >
        <Container>
          <ResponsiveStack style={styles.contentStack} spacing={32}>
            <View style={styles.mainColumn}>
              {/* Saudação */}
              <Text style={styles.greeting}>
                Olá, {user?.name ?? 'cliente'} 👋
              </Text>

              {/* Banner da barbearia */}
              <View
                style={[
                  styles.bannerWrapper,
                  isDesktop && styles.bannerWrapperDesktop,
                ]}
              >
                <Image
                  source={{
                    uri: 'https://conteudo.solutudo.com.br/wp-content/uploads/2020/01/BARBEARIA-ARACAJU-BARBEIRO-MESTRE.png',
                  }}
                  style={styles.bannerImage}
                />
                <View
                  style={styles.bannerOverlay}
                  pointerEvents={bannerOverlayPointerEvents}
                  {...getTouchDebugProps('dashboard-banner-overlay')}
                >
                  <Text style={styles.shopName}>VITINHO BARBER</Text>
                  <Text style={styles.shopAddress}>Centro 151, 29370-000</Text>
                  <Text style={styles.shopAddress}>
                    Conceição do Castelo - ES
                  </Text>
                </View>
              </View>

              {/* Conteúdo por aba */}
              {activeTab === 'home' && (
                <>
                  <View style={styles.homeHeaderRow}>
                    <Text style={styles.sectionTitle}>Serviços</Text>
                    <TouchableOpacity onPress={loadServices}>
                      <Text style={styles.sectionAction}>Atualizar</Text>
                    </TouchableOpacity>
                  </View>

                  {loadingServices ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator />
                      <Text style={styles.loadingText}>
                        Carregando serviços...
                      </Text>
                    </View>
                  ) : services.length === 0 ? (
                    <Text style={styles.emptyText}>
                      Nenhum serviço cadastrado ainda.
                    </Text>
                  ) : (
                    <FlatList
                      data={services}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      contentContainerStyle={{
                        paddingTop: 4,
                        paddingBottom: 12,
                      }}
                      ItemSeparatorComponent={() => (
                        <View style={{ height: 8 }} />
                      )}
                      renderItem={renderService}
                    />
                  )}

                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      !selectedService && { opacity: 0.6 },
                    ]}
                    onPress={handlePressSchedule}
                    disabled={!selectedService}
                  >
                    <Text style={styles.primaryButtonText}>
                      Agendar horário
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {activeTab === 'appointments' && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Meus agendamentos</Text>
                    <TouchableOpacity onPress={loadAppointments}>
                      <Text style={styles.sectionAction}>Atualizar</Text>
                    </TouchableOpacity>
                  </View>

                  {loadingAppointments ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator />
                      <Text style={styles.loadingText}>
                        Carregando seus horários...
                      </Text>
                    </View>
                  ) : appointments.length === 0 ? (
                    <Text style={styles.emptyText}>
                      Você ainda não tem agendamentos. Que tal marcar um agora?
                      ✂️
                    </Text>
                  ) : (
                    <FlatList
                      data={appointments}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      contentContainerStyle={{
                        paddingTop: 8,
                        paddingBottom: 16,
                      }}
                      ItemSeparatorComponent={() => (
                        <View style={{ height: 8 }} />
                      )}
                      renderItem={renderAppointment}
                    />
                  )}
                </>
              )}

              {activeTab === 'profile' && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.sectionTitle}>Perfil</Text>

                  <View style={styles.profileCard}>
                    <Text style={styles.profileLabel}>Nome</Text>
                    <Text style={styles.profileValue}>{user?.name}</Text>

                    <Text style={styles.profileLabel}>E-mail</Text>
                    <Text style={styles.profileValue}>{user?.email}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.logoutText}>Sair da conta</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {showSidePanel && (
              <View style={styles.sideColumn}>
                <Text style={styles.sectionTitle}>Perfil</Text>

                <View style={styles.profileCard}>
                  <Text style={styles.profileLabel}>Nome</Text>
                  <Text style={styles.profileValue}>{user?.name}</Text>

                  <Text style={styles.profileLabel}>E-mail</Text>
                  <Text style={styles.profileValue}>{user?.email}</Text>
                </View>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={onLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logoutText}>Sair da conta</Text>
                </TouchableOpacity>
              </View>
            )}
          </ResponsiveStack>
        </Container>
      </ScrollView>

      {/* Bottom Tabs */}
      <View
        style={[styles.tabBarWrap, isDesktop && styles.tabBarWrapDesktop]}
        pointerEvents="box-none"
      >
        <View
          style={[styles.tabBar, isDesktop && styles.tabBarDesktop]}
          {...getTouchDebugProps('dashboard-tab-bar')}
        >
          <TabButton label="Início" tab="home" />
          <TabButton label="Agendamentos" tab="appointments" />
          <TabButton label="Perfil" tab="profile" />
        </View>
      </View>
    </View>
  );
}

// estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    paddingTop: 60,
  },
  scrollContentMobile: {
    paddingBottom: 100,
  },
  scrollContentDesktop: {
    paddingBottom: 32,
  },
  contentStack: {
    alignItems: 'flex-start',
  },
  mainColumn: {
    flex: 1,
    width: '100%',
  },
  sideColumn: {
    width: '100%',
    maxWidth: 320,
  },
  greeting: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 12,
  },

  // Banner
  bannerWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#1f2937',
  },
  bannerWrapperDesktop: {
    height: 240,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  shopName: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '700',
  },
  shopAddress: {
    color: '#e5e7eb',
    fontSize: 12,
  },

  // Seções
  homeHeaderRow: {
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Botão principal
  primaryButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#022c22',
    fontWeight: '700',
    fontSize: 16,
  },

  // Loading / vazio
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

  // Cards de agendamento
  appointmentCard: {
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  appointmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  appointmentService: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentMeta: {
    marginTop: 2,
    color: '#9ca3af',
    fontSize: 12,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statusBadgeCompleted: {
    backgroundColor: '#052e16',
    borderColor: '#14532d',
  },
  statusBadgeText: {
    color: '#e5e7eb',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextCompleted: {
    color: '#86efac',
  },

  // Cards de serviço
  serviceCard: {
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  serviceCardSelected: {
    borderColor: '#22c55e',
  },
  serviceName: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceNameSelected: {
    color: '#bbf7d0',
  },
  serviceMeta: {
    color: '#9ca3af',
    fontSize: 12,
  },

  // Perfil
  profileCard: {
    marginTop: 8,
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  profileLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  profileValue: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: '#b91c1c',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fef2f2',
    fontWeight: '600',
    fontSize: 15,
  },

  // Bottom tab bar
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarWrapDesktop: {
    position: 'relative',
    bottom: undefined,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 24,
    maxWidth: 520,
    width: '100%',
  },
  tabBar: {
    paddingHorizontal: 24,
    paddingVertical: 20, // mais alto
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabBarDesktop: {
    borderTopWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#0b1220',
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 20, // aumentado
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#111827',
  },
  tabButtonText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  tabButtonTextActive: {
    color: '#f9fafb',
    fontWeight: '600',
  },
});
