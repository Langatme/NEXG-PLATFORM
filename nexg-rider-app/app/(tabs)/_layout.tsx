import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NexGPillTabBar } from '@/components/ui/NexGPillTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <NexGPillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Tabs.Screen
        name="jobs"
        options={{ title: 'Jobs', tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="delivery"
        options={{ title: 'Active', tabBarIcon: ({ color, size }) => <Ionicons name="navigate-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="earnings"
        options={{ title: 'Earnings', tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
