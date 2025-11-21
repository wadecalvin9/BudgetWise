import { SecurityService } from '@/services/securityService';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider as CustomThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { migrateDbIfNeeded } from '@/db';
import { SQLiteProvider } from 'expo-sqlite';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { activeTheme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    checkInitialLock();
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const checkInitialLock = async () => {
    const isPinEnabled = await SecurityService.isPinEnabled();
    if (isPinEnabled) {
      router.replace('/lock');
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to the foreground
      const isPinEnabled = await SecurityService.isPinEnabled();
      // Check if we are already in the lock screen to avoid loop
      const inLockScreen = segments[0] === 'lock';

      if (isPinEnabled && !inLockScreen) {
        router.replace('/lock');
      }
    }
    appState.current = nextAppState;
  };

  return (
    <ThemeProvider value={activeTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="budget.db" onInit={migrateDbIfNeeded}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recurring" options={{ headerShown: false }} />
          <Stack.Screen name="add-recurring" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="help" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="security" options={{ headerShown: false }} />
          <Stack.Screen name="lock" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="credits" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      </SQLiteProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
  });

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <CustomThemeProvider>
      <RootLayoutNav />
    </CustomThemeProvider>
  );
}
