import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type BadgeDTO,
  type EventDTO,
  type PostDTO,
  createPost,
  listBadges,
  listEvents,
  listPosts,
  listTodayEvents,
  markPresence,
} from './lib/api';

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

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const getErrorMessage = (fallback: string, error: unknown): string =>
  error instanceof Error ? error.message : fallback;

export default function App() {
  const [agenda, setAgenda] = useState<EventDTO[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(true);

  const [todayEvents, setTodayEvents] = useState<EventDTO[]>([]);
  const [presenceLoading, setPresenceLoading] = useState(true);
  const [presenceMarked, setPresenceMarked] = useState<Record<string, boolean>>({});
  const [markingEventId, setMarkingEventId] = useState<string | null>(null);

  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const handleRequestError = useCallback((fallback: string, error: unknown) => {
    Alert.alert('Erro', getErrorMessage(fallback, error));
  }, []);

  const fetchAgenda = useCallback(async () => {
    setAgendaLoading(true);
    try {
      const events = await listEvents();
      setAgenda(events);
    } catch (error) {
      handleRequestError('Não foi possível carregar a agenda.', error);
    } finally {
      setAgendaLoading(false);
    }
  }, [handleRequestError]);

  const fetchTodayEvents = useCallback(async () => {
    setPresenceLoading(true);
    try {
      const events = await listTodayEvents();
      setTodayEvents(events);
      setPresenceMarked((current) => {
        const next: Record<string, boolean> = {};
        events.forEach((event) => {
          next[event.id] = current[event.id] ?? false;
        });
        return next;
      });
    } catch (error) {
      handleRequestError('Não foi possível carregar os eventos do dia.', error);
    } finally {
      setPresenceLoading(false);
    }
  }, [handleRequestError]);

  const fetchBadges = useCallback(async () => {
    setBadgesLoading(true);
    try {
      const response = await listBadges();
      setBadges(response);
    } catch (error) {
      handleRequestError('Não foi possível carregar seus badges.', error);
    } finally {
      setBadgesLoading(false);
    }
  }, [handleRequestError]);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const response = await listPosts();
      setPosts(response);
    } catch (error) {
      handleRequestError('Não foi possível carregar o feed.', error);
    } finally {
      setPostsLoading(false);
    }
  }, [handleRequestError]);

  useEffect(() => {
    void fetchAgenda();
    void fetchTodayEvents();
    void fetchBadges();
    void fetchPosts();
  }, [fetchAgenda, fetchTodayEvents, fetchBadges, fetchPosts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAgenda(),
      fetchTodayEvents(),
      fetchBadges(),
      fetchPosts(),
    ]);
    setRefreshing(false);
  }, [fetchAgenda, fetchTodayEvents, fetchBadges, fetchPosts]);

  const handleMarkPresence = useCallback(
    async (eventId: string) => {
      setMarkingEventId(eventId);
      try {
        await markPresence(eventId);
        setPresenceMarked((current) => ({
          ...current,
          [eventId]: true,
        }));
        Alert.alert('Presença confirmada', 'Sua presença foi registrada.');
      } catch (error) {
        handleRequestError('Não foi possível marcar a presença.', error);
      } finally {
        setMarkingEventId(null);
      }
    },
    [handleRequestError],
  );

  const handleCreatePost = useCallback(async () => {
    const content = newPostContent.trim();
    if (!content || posting) {
      return;
    }

    setPosting(true);
    try {
      const created = await createPost(content);
      setPosts((current) => [created, ...current]);
      setNewPostContent('');
    } catch (error) {
      handleRequestError('Não foi possível publicar agora.', error);
    } finally {
      setPosting(false);
    }
  }, [handleRequestError, newPostContent, posting]);

  const isPostButtonDisabled = useMemo(
    () => posting || newPostContent.trim().length === 0,
    [posting, newPostContent],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agenda</Text>
          {agendaLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : agenda.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum evento na agenda.</Text>
          ) : (
            agenda.map((event) => (
              <View key={event.id} style={styles.card}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.cardSubtitle}>{formatEventPeriod(event)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presença</Text>
          {presenceLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : todayEvents.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum evento para hoje.</Text>
          ) : (
            todayEvents.map((event) => {
              const marked = presenceMarked[event.id];
              const isLoading = markingEventId === event.id;

              return (
                <View key={event.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.cardSubtitle}>{formatEventPeriod(event)}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={marked || isLoading}
                    onPress={() => void handleMarkPresence(event.id)}
                    style={[styles.button, (marked || isLoading) && styles.buttonDisabled]}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {marked ? 'Presença marcada' : 'Marcar presença'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          {badgesLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : badges.length === 0 ? (
            <Text style={styles.emptyText}>Você ainda não conquistou badges.</Text>
          ) : (
            <View style={styles.badgeGrid}>
              {badges.map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  <Text style={styles.badgeTitle}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                  <Text style={styles.badgeDate}>Conquistado em {formatDate(badge.earnedAt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feed</Text>
          <View style={styles.postComposer}>
            <TextInput
              multiline
              placeholder="Compartilhe algo com sua turma"
              placeholderTextColor="#9ca3af"
              style={styles.postInput}
              value={newPostContent}
              onChangeText={setNewPostContent}
            />
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => void handleCreatePost()}
              disabled={isPostButtonDisabled}
              style={[styles.button, isPostButtonDisabled && styles.buttonDisabled]}
            >
              {posting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>

          {postsLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : posts.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não há posts no feed.</Text>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <Text style={styles.postContent}>{post.content}</Text>
                <Text style={styles.postTimestamp}>{formatDateTime(post.createdAt)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#475569',
  },
  button: {
    marginTop: 4,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    flexBasis: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f1f5f9',
    gap: 4,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  badgeDescription: {
    fontSize: 13,
    color: '#475569',
  },
  badgeDate: {
    fontSize: 12,
    color: '#64748b',
  },
  postComposer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  postInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#0f172a',
  },
  postCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  postContent: {
    fontSize: 15,
    color: '#111827',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#64748b',
  },
});
