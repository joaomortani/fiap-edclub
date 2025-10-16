import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AttendanceStatus, EventDTO } from '@edclub/shared';

const timeFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
const dateFormat: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };

const formatEventPeriod = (event: EventDTO): string => {
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);
  const startsDate = startsAt.toLocaleDateString('pt-BR', dateFormat);
  const endsDate = endsAt.toLocaleDateString('pt-BR', dateFormat);
  const startTime = startsAt.toLocaleTimeString('pt-BR', timeFormat);
  const endTime = endsAt.toLocaleTimeString('pt-BR', timeFormat);

  if (startsAt.toDateString() === endsAt.toDateString()) {
    return `${startsDate} • ${startTime} - ${endTime}`;
  }

  return `${startsDate} ${startTime} - ${endsDate} ${endTime}`;
};

type AgendaScreenProps = {
  events: EventDTO[];
  todaysEvents: EventDTO[];
  attendanceStatus: Record<string, AttendanceStatus>;
  attendanceLoading: boolean;
  isLoading: boolean;
  refreshing: boolean;
  markingEventId: string | null;
  onRefresh: () => void | Promise<void>;
  onMarkAttendance: (eventId: string) => void | Promise<void>;
};

const AgendaScreen: React.FC<AgendaScreenProps> = ({
  events,
  todaysEvents,
  attendanceStatus,
  attendanceLoading,
  isLoading,
  refreshing,
  markingEventId,
  onRefresh,
  onMarkAttendance,
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            const result = onRefresh();
            if (result instanceof Promise) {
              void result;
            }
          }}
          tintColor="#ffffff"
          colors={["#2563eb"]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.subtitle}>
          Acompanhe seus próximos compromissos e confirme presença diretamente por aqui.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos de hoje</Text>
        <Text style={styles.sectionDescription}>
          Confirme sua participação nas atividades que acontecem hoje.
        </Text>
        {attendanceLoading ? (
          <ActivityIndicator color="#2563eb" />
        ) : todaysEvents.length === 0 ? (
          <Text style={styles.empty}>Você não possui eventos agendados para hoje.</Text>
        ) : (
          <View style={styles.listGap}>
            {todaysEvents.map((event) => {
              const status = attendanceStatus[event.id];
              const isMarked = status === 'present';
              const isButtonLoading = markingEventId === event.id;

              return (
                <View key={event.id} style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{event.title}</Text>
                    <Text style={styles.cardMeta}>{formatEventPeriod(event)}</Text>
                  </View>
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={isMarked || isButtonLoading}
                    onPress={() => onMarkAttendance(event.id)}
                    style={[styles.attendanceButton, isMarked && styles.attendanceButtonMarked]}
                  >
                    {isButtonLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.attendanceButtonText}>
                        {isMarked ? 'Presença registrada' : 'Marcar presença'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos eventos</Text>
        <Text style={styles.sectionDescription}>
          Veja o que está por vir na sua turma e mantenha o planejamento em dia.
        </Text>
        {isLoading ? (
          <ActivityIndicator color="#2563eb" />
        ) : events.length === 0 ? (
          <Text style={styles.empty}>Nenhum evento cadastrado no momento.</Text>
        ) : (
          <View style={styles.listGap}>
            {events.map((event) => (
              <View key={event.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.cardMeta}>{formatEventPeriod(event)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#cbd5f5',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
  listGap: {
    gap: 16,
  },
  card: {
    backgroundColor: '#16213f',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    gap: 12,
  },
  cardInfo: {
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  cardMeta: {
    fontSize: 14,
    color: '#94a3b8',
  },
  attendanceButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
  attendanceButtonMarked: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  attendanceButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  empty: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default AgendaScreen;
