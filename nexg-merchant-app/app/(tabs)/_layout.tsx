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
        name="orders"
        options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="catalog"
        options={{ title: 'Catalog', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="finance"
        options={{ title: 'Finance', tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
