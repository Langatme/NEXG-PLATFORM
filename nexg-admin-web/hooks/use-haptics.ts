// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/hooks/useHaptics.ts).
// Intent-based haptics: components declare *why* (selection/success/...), never which API.
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export type HapticIntent =
  | 'selection'
  | 'tick'
  | 'toggle-on'
  | 'toggle-off'
  | 'impact-light'
  | 'impact-medium'
  | 'success'
  | 'warning'
  | 'error';

const ANDROID_HAPTICS: Record<HapticIntent, Haptics.AndroidHaptics> = {
  selection: Haptics.AndroidHaptics.Segment_Tick,
  tick: Haptics.AndroidHaptics.Clock_Tick,
  'toggle-on': Haptics.AndroidHaptics.Toggle_On,
  'toggle-off': Haptics.AndroidHaptics.Toggle_Off,
  'impact-light': Haptics.AndroidHaptics.Virtual_Key,
  'impact-medium': Haptics.AndroidHaptics.Long_Press,
  success: Haptics.AndroidHaptics.Confirm,
  warning: Haptics.AndroidHaptics.Reject,
  error: Haptics.AndroidHaptics.Reject,
};

function perform(intent: HapticIntent): Promise<void> {
  if (Platform.OS === 'android') {
    return Haptics.performAndroidHapticsAsync(ANDROID_HAPTICS[intent]);
  }
  switch (intent) {
    case 'selection':
    case 'tick':
      return Haptics.selectionAsync();
    case 'impact-medium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'warning':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    case 'error':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    default:
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

/**
 * Fire and forget. Never throws and never rejects — haptics are decoration and
 * must not take an onPress handler down (missing native module, user disabled).
 * Call on the JS thread (expo module is JS-bound; use runOnJS from worklets).
 */
export function triggerHaptic(intent: HapticIntent = 'impact-light'): void {
  try {
    perform(intent).catch(() => {});
  } catch {
    // Kept so a future synchronous throw cannot break a press either.
  }
}

/**
 * Stable trigger that no-ops while `enabled` is false — the shape every
 * component's `haptic` prop plugs into. Identity only changes with `enabled`,
 * so it is safe in useCallback deps and won't defeat React.memo boundaries.
 */
export function useHaptics(enabled: boolean = true) {
  return useCallback(
    (intent: HapticIntent = 'impact-light') => {
      if (!enabled) return;
      triggerHaptic(intent);
    },
    [enabled]
  );
}
