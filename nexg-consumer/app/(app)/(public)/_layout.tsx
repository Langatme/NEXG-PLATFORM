import { useTheme } from '@/theme';
import { Stack } from 'expo-router';

const Layout = () => {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}
      />
      <Stack.Screen
        name="other-options"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          title: '',
          sheetAllowedDetents: [0.6],
          sheetCornerRadius: 16,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="verify-email" options={{ headerShown: false }} />
      <Stack.Screen name="mfa" options={{ headerShown: false }} />
      <Stack.Screen name="recovery" options={{ headerShown: false }} />
      <Stack.Screen name="reset" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="permissions" options={{ headerShown: false }} />
      <Stack.Screen name="qr" options={{ headerShown: false }} />
    </Stack>
  );
};
export default Layout;
