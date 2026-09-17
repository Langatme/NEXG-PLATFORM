import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

const PRESS_EASING = Easing.bezier(0.23, 1, 0.32, 1);

interface PressScaleHandlers {
  onPressIn: () => void;
  onPressOut: () => void;
}

/**
 * Press feedback shared by buttons and chips: 0.97-scale in 120ms,
 * release in 160ms, all on the UI thread. Under reduced motion the scale
 * is skipped and a press dim is used instead (opacity still signals state).
 */
export function usePressScale(activeScale = 0.97) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const pressHandlers: PressScaleHandlers = {
    onPressIn: () => {
      pressed.value = reduceMotion ? 1 : withTiming(1, { duration: 120, easing: PRESS_EASING });
    },
    onPressOut: () => {
      pressed.value = reduceMotion ? 0 : withTiming(0, { duration: 160, easing: PRESS_EASING });
    },
  };

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : 1 - (1 - activeScale) * pressed.value }],
    opacity: reduceMotion && pressed.value === 1 ? 0.65 : 1,
  }));

  return { pressHandlers, pressStyle };
}
