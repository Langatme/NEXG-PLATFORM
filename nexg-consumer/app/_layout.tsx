import { Nunito_400Regular, Nunito_700Bold, Nunito_900Black, useFonts } from '@expo-google-fonts/nunito';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { NexGSplash } from '@/components/ui/NexGSplash';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, retry: 1 } },
});

export default function Layout() {
  const [loaded] = useFonts({ Nunito_400Regular, Nunito_700Bold, Nunito_900Black });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => undefined);
      trackEvent('app_open');
    }
  }, [loaded]);
  if (!loaded) return <NexGSplash />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
