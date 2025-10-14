import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

const BadgesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Badges</Text>
        <Text style={styles.description}>
          Conquiste badges ao completar desafios e acompanhar seu progresso acadêmico.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
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
});

export default BadgesScreen;
