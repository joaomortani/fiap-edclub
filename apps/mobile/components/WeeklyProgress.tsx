import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getWeeklyProgress } from '../api/engagement';

type WeeklyProgressState = {
  presents: number;
  total: number;
  percent: number;
};

const INITIAL_STATE: WeeklyProgressState = {
  presents: 0,
  total: 0,
  percent: 0,
};

const clampPercent = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
};

const WeeklyProgress: React.FC = () => {
  const [progress, setProgress] = useState<WeeklyProgressState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        const response = await getWeeklyProgress();

        if (!isMounted) {
          return;
        }

        setProgress({
          presents: response.presents ?? 0,
          total: response.total ?? 0,
          percent: clampPercent(response.percent ?? 0),
        });
        setHasError(false);
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          setProgress(INITIAL_STATE);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} accessibilityLabel="Carregando progresso semanal">
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer} accessibilityLabel="Erro ao carregar progresso semanal">
        <Text style={styles.errorText}>Não foi possível carregar seu progresso agora.</Text>
      </View>
    );
  }

  const percent = progress.total === 0 ? 0 : clampPercent(progress.percent);
  const legend = `${progress.presents}/${progress.total}`;

  return (
    <View
      accessibilityLabel={`Progresso semanal: ${percent.toFixed(1)} por cento, ${legend} presenças.`}
      accessibilityRole="progressbar"
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Progresso semanal</Text>
        <Text style={styles.value}>{percent.toFixed(1)}%</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.legend}>Presenças registradas: {legend}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
  },
  barBackground: {
    height: 10,
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#34d399',
  },
  legend: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
  },
});

export default WeeklyProgress;
