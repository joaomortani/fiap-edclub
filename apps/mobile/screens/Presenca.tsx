import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import WeeklyProgress from '../components/WeeklyProgress';

const PresencaScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Presença</Text>
        <Text style={styles.description}>
          Visualize suas presenças e faltas registradas ao longo do semestre.
        </Text>

        <View style={styles.section}>
          <WeeklyProgress />
        </View>

        <Text style={styles.helperText}>
          Consulte o histórico detalhado de presenças na agenda e mantenha seu ritmo para desbloquear novas conquistas.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4b5563',
  },
  section: {
    marginTop: 24,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    marginTop: 16,
  },
});

export default PresencaScreen;
