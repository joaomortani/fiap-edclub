import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';

import AgendaScreen from './screens/Agenda';
import BadgesScreen from './screens/Badges';
import FeedScreen from './screens/Feed';
import LoginScreen from './screens/Login';
import PresencaScreen from './screens/Presenca';
import RankingScreen from './screens/RankingScreen';

const AUTH_TOKEN_KEY = 'edclub-auth-token';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type AppTabsProps = {
  onLogout: () => Promise<void>;
};

type LoginScreenProps = {
  onLogin: (token: string) => Promise<void>;
};

function AppTabs({ onLogout }: AppTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
          >
            <Text style={styles.headerButtonText}>Sair</Text>
          </Pressable>
        ),
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Presença" component={PresencaScreen} />
      <Tab.Screen name="Badges" component={BadgesScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
    </Tab.Navigator>
  );
}

function AuthenticatedStack({ onLogout }: AppTabsProps) {
  return (
    <Stack.Screen name="AppTabs" options={{ headerShown: false }}>
      {() => <AppTabs onLogout={onLogout} />}
    </Stack.Screen>
  );
}

function UnauthenticatedStack({ onLogin }: LoginScreenProps) {
  return (
    <Stack.Screen name="Login" options={{ headerShown: false }}>
      {() => <LoginScreen onLogin={onLogin} />}
    </Stack.Screen>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        setToken(storedToken);
      } finally {
        setInitializing(false);
      }
    };

    loadToken();
  }, []);

  const handleLogin = useCallback(async (value: string) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, value);
    setToken(value);
  }, []);

  const handleLogout = useCallback(async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    setToken(null);
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <AuthenticatedStack onLogout={handleLogout} />
        ) : (
          <UnauthenticatedStack onLogin={handleLogin} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  headerButton: {
    marginRight: 16,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
});
