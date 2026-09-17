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
        name="portfolio"
        options={{ title: 'Portfolio', tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="reservations"
        options={{ title: 'Bookings', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ title: 'Tasks', tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
