import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BadgeDTO } from '@edclub/shared';

import { listMyBadges } from '../api/badges';
import BadgeIcon from '../components/BadgeIcon';

const BadgesScreen: React.FC = () => {
  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        const response = await listMyBadges();

        if (!isMounted) {
          return;
        }

        setBadges(response);
        setHasError(false);
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          setBadges([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBadges();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderItem = ({ item }: { item: BadgeDTO }) => (
    <View style={styles.badgeCard}>
      {item.iconUrl ? (
        <Image
          source={{ uri: item.iconUrl }}
          style={styles.badgeImage}
          accessibilityLabel={`Ícone do badge ${item.name}`}
        />
      ) : (
        <View style={styles.badgeIconWrapper}>
          <BadgeIcon name={item.name} size={28} color="#2563eb" />
        </View>
      )}
      <View style={styles.badgeContent}>
        <Text style={styles.badgeTitle}>{item.name}</Text>
        <Text style={styles.badgeDescription}>{item.description}</Text>
        <Text style={styles.badgeDate}>Conquistado em {new Date(item.earnedAt).toLocaleDateString('pt-BR')}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={badges}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Badges</Text>
            <Text style={styles.description}>
              Conquiste badges ao completar desafios e acompanhar seu progresso acadêmico.
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : hasError ? (
            <View style={styles.emptyState}>
              <Text style={styles.errorText}>Não foi possível carregar suas conquistas agora.</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Você ainda não possui badges conquistadas.</Text>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  listContent: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4b5563',
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badgeImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  badgeIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badgeDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  badgeDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
  separator: {
    height: 16,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
  },
});

export default BadgesScreen;
