import { useEffect, useState } from 'react';

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppLaunchAnimation } from '../components/AppLaunchAnimation';
import { useShopStore } from '../store/useShopStore';
import { COLORS } from '../services/theme';

export default function RootLayout() {
  const loadCatalog = useShopStore((state) => state.loadCatalog);
  const advanceOrderStatuses = useShopStore((state) => state.advanceOrderStatuses);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(true);

  useEffect(() => {
    void loadCatalog();

    const interval = setInterval(() => {
      advanceOrderStatuses();
    }, 1000);

    return () => clearInterval(interval);
  }, [advanceOrderStatuses, loadCatalog]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }} />
      {showLaunchAnimation ? <AppLaunchAnimation onDone={() => setShowLaunchAnimation(false)} /> : null}
    </SafeAreaProvider>
  );
}
