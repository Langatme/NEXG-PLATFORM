// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { fontFamilies, useTheme } from '@/theme';

const ENTER_EASING = Easing.bezier(0.23, 1, 0.32, 1);

type TabIcon = (args: { focused: boolean; color: string; size: number }) => React.ReactNode;

interface PillTabItemProps {
  label: string;
  accessibilityLabel: string;
  focused: boolean;
  icon: TabIcon;
  activeColor: string;
  inactiveColor: string;
  pillFrom: string;
  pillTo: string;
  onPress: () => void;
  onLongPress: () => void;
}

function PillTabItem({
  label,
  accessibilityLabel,
  focused,
  icon,
  activeColor,
  inactiveColor,
  pillFrom,
  pillTo,
  onPress,
  onLongPress,
}: PillTabItemProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(focused ? 1 : 0);
  const pressed = useSharedValue(0);

  React.useEffect(() => {
    if (reduceMotion) {
      progress.value = focused ? 1 : 0;
    } else {
      progress.value = withTiming(focused ? 1 : 0, { duration: 200, easing: ENTER_EASING });
    }
  }, [focused, progress, reduceMotion]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [pillFrom, pillTo]),
    transform: [{ scale: 1 - 0.03 * pressed.value }],
  }));

  const setPressed = (v: number) => {
    if (reduceMotion) {
      pressed.value = v;
    } else {
      pressed.value = withTiming(v, { duration: v === 1 ? 120 : 160, easing: ENTER_EASING });
    }
  };

  const contentColor = focused ? activeColor : inactiveColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setPressed(1)}
      onPressOut={() => setPressed(0)}
      style={styles.itemHit}
    >
      <Animated.View style={[styles.itemPill, pillStyle]}>
        {icon({ focused, color: contentColor, size: 22 })}
        <Text style={[styles.itemLabel, { color: contentColor }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Floating pill tab bar (in-flow, never overlays screen content).
 * Active tab crossfades to a filled pill on the UI thread; press gives
 * 0.97-scale feedback + one haptic on commit. Honors reduced motion.
 *
 * Props are a narrow owned contract (not the vendored navigator types), so
 * this bar works with any tab router that supplies routes + descriptors.
 */
export interface NexGPillTabBarProps {
  state: { index: number; routes: Array<{ key: string; name: string }> };
  descriptors: PillBarDescriptorMap;
  navigation: PillBarNavigation;
}

interface PillBarDescriptorMap {
  [key: string]: PillBarDescriptor;
}

interface PillBarDescriptor {
  options: {
    title?: string;
    tabBarAccessibilityLabel?: string;
    tabBarIcon?: (args: { focused: boolean; color: string; size: number }) => React.ReactNode;
  };
}

interface PillBarNavigation {
  emit: (event: PillBarEvent) => void;
  navigate: (name: string) => void;
}

interface PillBarEvent {
  type: 'tabPress' | 'tabLongPress';
  target: string;
  canPreventDefault: boolean;
}

export function NexGPillTabBar({ state, descriptors, navigation }: NexGPillTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingBottom: insets.bottom + 12 }]}>
      <View
        accessibilityRole="tablist"
        style={[styles.pill, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle }]}
      >
        {state.routes.map((route, index) => {
          const options = descriptors[route.key].options;
          const label = options.title ?? route.name;
          const focused = state.index === index;
          const icon = options.tabBarIcon;
          if (!icon) return null;
          const itemIcon: TabIcon = (args) => icon(args);
          return (
            <PillTabItem
              key={route.key}
              label={label}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              focused={focused}
              icon={itemIcon}
              activeColor={colors.text.inverse}
              inactiveColor={colors.text.muted}
              pillFrom={colors.surface.primary}
              pillTo={colors.action.primary}
              onPress={() => {
                // No tabPress listeners exist in these apps, so navigate
                // directly after emitting (no defaultPrevented to honor).
                if (focused) return;
                navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                navigation.navigate(route.name);
                Haptics.selectionAsync().catch(() => undefined);
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key, canPreventDefault: true })}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 16, paddingTop: 10 },
  pill: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 28,
    padding: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  itemHit: { flex: 1 },
  itemPill: { borderRadius: 22, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center', gap: 2 },
  itemLabel: { fontFamily: fontFamilies.bold, fontSize: 11, lineHeight: 14 },
});
