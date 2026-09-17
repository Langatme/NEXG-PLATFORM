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
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="activity"
        options={{ title: 'Activity', tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
