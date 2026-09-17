import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// R-05 push for offers (additive; 15s poll + SSE remain the contract).
// Deep-link payload: { deliveryId } → nexg://delivery/<id> handled by router.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPush(): Promise<{ token: string; platform: string } | null> {
  if (!Device.isDevice) return null;
  const perm = await Notifications.requestPermissionsAsync();
  if (perm.status !== 'granted') return null;
  try {
    const t = await Notifications.getExpoPushTokenAsync();
    return { token: t.data, platform: Device.osName ?? 'unknown' };
  } catch {
    return null;
  }
}
