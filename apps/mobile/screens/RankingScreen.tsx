import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getWeeklyRank } from '../api/engagement';

type RankEntry = {
  userId: string;
  presents: number;
  total: number;
  percent: number;
};

const truncateIdentifier = (value: string) => {
  if (!value) {
    return 'Usuário';
  }

  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}…${value.slice(-4)}`;
};

const RankingScreen: React.FC = () => {
  const [rank, setRank] = useState<RankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadRank = useCallback(async () => {
    try {
      const response = await getWeeklyRank();
      setRank(response);
      setHasError(false);
    } catch (error) {
      setHasError(true);
      setRank([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRank();
  }, [loadRank]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRank();
  }, [loadRank]);

  const renderItem = ({ item, index }: { item: RankEntry; index: number }) => {
    const iconName = index === 0 ? 'trophy' : 'star';

    return (
      <View style={styles.card}>
        <MaterialCommunityIcons
          accessible={false}
          name={iconName}
          size={26}
          color={index === 0 ? '#f59e0b' : '#2563eb'}
        />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{truncateIdentifier(item.userId)}</Text>
          <Text style={styles.cardSubtitle}>
            {item.presents} de {item.total} presenças
          </Text>
        </View>
        <Text style={styles.cardValue}>{item.percent.toFixed(1)}%</Text>
      </View>
    );
  };

  const listEmptyComponent = () => (
    <View style={styles.emptyState}>
      {hasError ? (
        <Text style={styles.errorText}>Não foi possível carregar o ranking desta semana.</Text>
      ) : (
        <Text style={styles.emptyText}>Nenhum participante ranqueado nesta semana ainda.</Text>
      )}
    </View>
  );

  if (isLoading && rank.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={rank}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Ranking semanal</Text>
            <Text style={styles.subtitle}>Top 5 presenças da semana atual.</Text>
          </View>
        }
        ListEmptyComponent={listEmptyComponent}
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 24,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardBody: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
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
  separator: {
    height: 12,
  },
  emptyState: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
});

export default RankingScreen;
