import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import type { AttendanceStatus, BadgeDTO, EventDTO, PostDTO } from '@edclub/shared';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';

import { getAttendanceStatus, listEvents, markAttendance } from './api/events';
import { listMyBadges } from './api/badges';
import { createPost, listPosts } from './api/posts';
import BadgeIcon from './components/BadgeIcon';
import WeeklyProgress from './components/WeeklyProgress';
import AgendaScreen from './screens/Agenda';
import LoginScreen from './screens/Login';
import { supabase } from './lib/supabase';

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

const isToday = (value: string): boolean => {
  const target = new Date(value);
  const today = new Date();

  return (
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate()
  );
};

type NavItem = {
  key: string;
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Início', icon: 'home-variant' },
  { key: 'agenda', label: 'Agenda', icon: 'calendar-month' },
  { key: 'attendance', label: 'Presença', icon: 'check-decagram' },
  { key: 'badges', label: 'Badges', icon: 'medal-outline' },
  { key: 'feed', label: 'Feed', icon: 'message-text-outline' },
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [agenda, setAgenda] = useState<EventDTO[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [agendaError, setAgendaError] = useState<string | null>(null);

  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [markingEventId, setMarkingEventId] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);

  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postsError, setPostsError] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [activeNavKey, setActiveNavKey] = useState<NavItem['key']>('home');

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          setSession(null);
          setSessionError(error.message);
        } else {
          setSession(data.session ?? null);
          setSessionError(null);
        }
      } catch (error) {
        if (isMounted) {
          setSession(null);
          setSessionError(
            error instanceof Error ? error.message : 'Não foi possível carregar a sessão atual.',
          );
        }
      } finally {
        if (isMounted) {
          setSessionLoading(false);
        }
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setSessionError(null);
      setSessionLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchAgenda = useCallback(async () => {
    if (!session) {
      setAgenda([]);
      setAgendaError(null);
      return;
    }

    setAgendaLoading(true);
    try {
      const events = await listEvents();
      setAgenda(events);
      setAgendaError(null);
    } catch (error) {
      setAgendaError(getErrorMessage('Não foi possível carregar a agenda.', error));
    } finally {
      setAgendaLoading(false);
    }
  }, [session]);

  const fetchBadges = useCallback(async () => {
    if (!session) {
      setBadges([]);
      setBadgesError(null);
      return;
    }

    setBadgesLoading(true);
    try {
      const response = await listMyBadges();
      setBadges(response);
      setBadgesError(null);
    } catch (error) {
      setBadgesError(getErrorMessage('Não foi possível carregar seus badges.', error));
    } finally {
      setBadgesLoading(false);
    }
  }, [session]);

  const fetchPosts = useCallback(async () => {
    if (!session) {
      setPosts([]);
      setPostsError(null);
      return;
    }

    setPostsLoading(true);
    try {
      const response = await listPosts();
      setPosts(response);
      setPostsError(null);
    } catch (error) {
      setPostsError(getErrorMessage('Não foi possível carregar o feed.', error));
    } finally {
      setPostsLoading(false);
    }
  }, [session]);

  const handleRefresh = useCallback(async () => {
    if (!session) {
      return;
    }

    setRefreshing(true);
    await Promise.all([fetchAgenda(), fetchBadges(), fetchPosts()]);
    setRefreshing(false);
  }, [fetchAgenda, fetchBadges, fetchPosts, session]);

  useEffect(() => {
    if (!session) {
      setAgenda([]);
      setBadges([]);
      setPosts([]);
      setAttendanceStatus({});
      setAgendaError(null);
      setBadgesError(null);
      setPostsError(null);
      setAttendanceError(null);
      return;
    }

    void handleRefresh();
  }, [handleRefresh, session]);

  const todaysEvents = useMemo(
    () => agenda.filter((event) => isToday(event.startsAt)),
    [agenda],
  );

  const upcomingEvents = useMemo(() => agenda.slice(0, 5), [agenda]);

  useEffect(() => {
    if (!session) {
      setAttendanceStatus({});
      setAttendanceLoading(false);
      setAttendanceError(null);
      return;
    }

    const eventIds = todaysEvents.map((event) => event.id);

    if (eventIds.length === 0) {
      setAttendanceStatus({});
      setAttendanceLoading(false);
      setAttendanceError(null);
      return;
    }

    let isMounted = true;
    setAttendanceLoading(true);

    setAttendanceError(null);

    getAttendanceStatus(eventIds)
      .then((result) => {
        if (isMounted) {
          setAttendanceStatus(result);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setAttendanceError(
            getErrorMessage('Não foi possível carregar as presenças de hoje.', error),
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setAttendanceLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session, todaysEvents]);

  const handleMarkAttendance = useCallback(async (eventId: string) => {
    setMarkingEventId(eventId);
    try {
      await markAttendance(eventId, 'present');
      setAttendanceStatus((current) => ({
        ...current,
        [eventId]: 'present',
      }));
      setAttendanceError(null);
      Alert.alert('Presença confirmada', 'Sua presença foi registrada.');
    } catch (error) {
      setAttendanceError(getErrorMessage('Não foi possível marcar a presença.', error));
    } finally {
      setMarkingEventId(null);
    }
  }, []);

  const handleCreatePost = useCallback(async () => {
    const content = newPostContent.trim();
    if (!content || posting || !session) {
      return;
    }

    setPosting(true);
    try {
      const created = await createPost(content);
      setPosts((current) => [created, ...current]);
      setNewPostContent('');
      setPostsError(null);
    } catch (error) {
      setPostsError(getErrorMessage('Não foi possível publicar agora.', error));
    } finally {
      setPosting(false);
    }
  }, [newPostContent, posting, session]);

  const isPostButtonDisabled = useMemo(
    () => posting || newPostContent.trim().length === 0,
    [posting, newPostContent],
  );

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      Alert.alert('Erro', getErrorMessage('Não foi possível encerrar a sessão.', error));
    }
  }, []);

  const clearSessionError = useCallback(() => {
    setSessionError(null);
  }, []);

  const handleNavPress = useCallback((itemKey: NavItem['key']) => {
    if (itemKey === 'home' || itemKey === 'agenda') {
      setActiveNavKey(itemKey);
      return;
    }

    Alert.alert('Em breve', 'Essa área estará disponível em breve.');
  }, []);

  const renderHomeContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#ffffff"
          colors={["#2563eb"]}
        />
      }
    >
      <View style={styles.heroContainer}>
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerGreeting}>Olá,</Text>
            <Text style={styles.headerUser}>{session.user?.email ?? 'Aluno EDClub'}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => void handleSignOut()}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Seu hub acadêmico</Text>
          <Text style={styles.heroTitle}>Organize sua rotina com o EDClub</Text>
          <Text style={styles.heroSubtitle}>
            Acompanhe eventos, marque presença e compartilhe conquistas com a comunidade.
          </Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            <Text style={styles.sectionSubtitle}>Próximos compromissos da sua turma</Text>
          </View>
          {!!agendaError && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {agendaError}
            </Text>
          )}
          {agendaLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : upcomingEvents.length === 0 && !agendaError ? (
            <Text style={styles.emptyText}>Nenhum evento na agenda.</Text>
          ) : (
            <View style={styles.listGap}>
              {upcomingEvents.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventPeriod}>{formatEventPeriod(event)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Presença</Text>
            <Text style={styles.sectionSubtitle}>Eventos de hoje para confirmar presença</Text>
          </View>
          <WeeklyProgress />
          {!!attendanceError && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {attendanceError}
            </Text>
          )}
          {attendanceLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : todaysEvents.length === 0 && !attendanceError ? (
            <Text style={styles.emptyText}>Você não possui eventos para hoje.</Text>
          ) : (
            <View style={styles.listGap}>
              {todaysEvents.map((event) => {
                const status = attendanceStatus[event.id];
                const isMarked = status === 'present';
                const isLoading = markingEventId === event.id;

                return (
                  <View key={event.id} style={styles.attendanceCard}>
                    <View style={styles.attendanceInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventPeriod}>{formatEventPeriod(event)}</Text>
                    </View>
                    <TouchableOpacity
                      accessibilityRole="button"
                      disabled={isMarked || isLoading}
                      onPress={() => void handleMarkAttendance(event.id)}
                      style={[styles.attendanceButton, isMarked && styles.attendanceButtonMarked]}
                    >
                      {isLoading ? (
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Text style={styles.sectionSubtitle}>Conquistas desbloqueadas recentemente</Text>
          </View>
          {!!badgesError && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {badgesError}
            </Text>
          )}
          {badgesLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : badges.length === 0 && !badgesError ? (
            <Text style={styles.emptyText}>Nenhum badge conquistado ainda.</Text>
          ) : (
            <View style={styles.listGap}>
              {badges.map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  <View style={styles.badgeIconWrapper}>
                    <BadgeIcon name={badge.name} />
                  </View>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feed</Text>
            <Text style={styles.sectionSubtitle}>Compartilhe novidades com a turma</Text>
          </View>
          {!!postsError && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {postsError}
            </Text>
          )}
          <View style={styles.postComposer}>
            <Text style={styles.postComposerLabel}>Publique algo</Text>
            <TextInput
              style={styles.postInput}
              placeholder="Compartilhe uma atualização..."
              placeholderTextColor="#64748b"
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
            />
            <TouchableOpacity
              accessibilityRole="button"
              disabled={isPostButtonDisabled}
              onPress={() => void handleCreatePost()}
              style={[styles.publishButton, isPostButtonDisabled && styles.publishButtonDisabled]}
            >
              {posting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.publishButtonText}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>

          {postsLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : posts.length === 0 && !postsError ? (
            <Text style={styles.emptyText}>Ainda não há posts no feed.</Text>
          ) : (
            <View style={styles.listGap}>
              {posts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <Text style={styles.postContent}>{post.content}</Text>
                  <Text style={styles.postTimestamp}>{formatDateTime(post.createdAt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  if (sessionLoading) {
    return (
      <SafeAreaView style={styles.loadingSafeArea}>
        <ActivityIndicator color="#ffffff" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <LoginScreen initialError={sessionError} onAuthenticated={clearSessionError} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appContainer}>
        {activeNavKey === 'agenda' ? (
          <AgendaScreen
            attendanceLoading={attendanceLoading}
            attendanceStatus={attendanceStatus}
            events={agenda}
            isLoading={agendaLoading}
            markingEventId={markingEventId}
            onMarkAttendance={handleMarkAttendance}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            todaysEvents={todaysEvents}
          />
        ) : (
          renderHomeContent()
        )}
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeNavKey;
            const isSupported = item.key === 'home' || item.key === 'agenda';

            return (
              <TouchableOpacity
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive, disabled: !isSupported }}
                onPress={() => handleNavPress(item.key)}
                style={styles.navItem}
              >
                <MaterialCommunityIcons
                  accessibilityLabel={item.label}
                  name={item.icon}
                  size={24}
                  color={isActive ? '#2563eb' : isSupported ? '#94a3b8' : 'rgba(148,163,184,0.4)'}
                />
                <Text style={[styles.navItemLabel, isActive && styles.navItemLabelActive]}>{item.label}</Text>
                <View
                  style={[
                    styles.navItemIndicator,
                    !isActive && styles.navItemIndicatorInactive,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingSafeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroContainer: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 14,
    color: '#cbd5f5',
  },
  headerUser: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  signOutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  signOutButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#1d4ed8',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#bfdbfe',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#e0f2fe',
  },
  mainContent: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 24,
    marginTop: -16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#475569',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 14,
    color: '#b91c1c',
  },
  listGap: {
    gap: 12,
  },
  eventCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  eventPeriod: {
    fontSize: 14,
    color: '#475569',
  },
  attendanceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 12,
  },
  attendanceInfo: {
    gap: 6,
  },
  attendanceButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  attendanceButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  attendanceButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#f8fafc',
    gap: 8,
  },
  badgeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
  },
  badgeImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
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
    borderRadius: 18,
    padding: 14,
    gap: 12,
    backgroundColor: '#f8fafc',
  },
  postInput: {
    minHeight: 70,
    fontSize: 15,
    color: '#0f172a',
  },
  publishButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  publishButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  postCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  postContent: {
    fontSize: 15,
    color: '#0f172a',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#64748b',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  navItemLabelActive: {
    color: '#2563eb',
  },
  navItemIndicator: {
    marginTop: 6,
    height: 4,
    width: 28,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
  navItemIndicatorInactive: {
    backgroundColor: 'transparent',
  },
});
