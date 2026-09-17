import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { NEXG_INK_DARK, NEXG_INK_LIGHT, NEXG_SPLASH_BG_DARK, NEXG_SPLASH_BG_LIGHT, NexGLogo } from './NexGLogo';

interface NexGSplashProps {
  mode?: 'light' | 'dark';
  logoWidth?: number;
  testID?: string;
}

const ENTER_EASING = Easing.bezier(0.23, 1, 0.32, 1);

export const NexGSplash = ({ mode, logoWidth = 168, testID }: NexGSplashProps) => {
  const scheme = useColorScheme();
  const dark = mode ? mode === 'dark' : scheme === 'dark';
  const reduceMotion = useReducedMotion();
  const [systemReduce, setSystemReduce] = React.useState(false);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    const sub = AccessibilityInfo.isReduceMotionEnabled?.().then(setSystemReduce).catch(() => undefined);
    void sub;
  }, []);

  useEffect(() => {
    const instant = reduceMotion || systemReduce;
    opacity.value = instant ? 1 : withTiming(1, { duration: 250, easing: ENTER_EASING });
    scale.value = instant ? 1 : withTiming(1, { duration: 250, easing: ENTER_EASING });
  }, [opacity, reduceMotion, scale, systemReduce]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      testID={testID}
      accessibilityLabel="NEXG loading"
      style={[styles.root, { backgroundColor: dark ? NEXG_SPLASH_BG_DARK : NEXG_SPLASH_BG_LIGHT }]}
    >
      <Animated.View style={animatedStyle}>
        <NexGLogo
          ink={dark ? NEXG_INK_DARK : NEXG_INK_LIGHT}
          width={logoWidth}
          height={Math.round((logoWidth * 504) / 396)}
          testID="nexg-logo"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
