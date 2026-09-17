import { useTheme } from '@/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGText } from './NexGText';

const WINDOW_HEIGHT = Dimensions.get('window').height;

/**
 * Spring tuned to Apple's sheet spec: damping ratio 0.8, response 0.3s.
 * stiffness = (2π/response)², damping = ratio · 2√(stiffness·mass)
 */
const SHEET_SPRING = { stiffness: 440, damping: 34, mass: 1, reduceMotion: ReduceMotion.System };

/** Apple's momentum projection (Designing Fluid Interfaces): exponential decay. */
const project = (velocity: number, decelerationRate = 0.998): number =>
  (velocity / 1000) * (decelerationRate / (1 - decelerationRate));

/** Progressive resistance past a boundary — things slow down before they stop. */
const rubberband = (overshoot: number, dimension: number, constant = 0.55): number =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));

interface NexGBottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Fractions of window height, ascending. First = entry snap; last = max drag-up. Default [0.55]. */
  snapPoints?: number[];
  title?: string;
  children: React.ReactNode;
}

/**
 * Gesture-driven bottom sheet.
 * - 1:1 tracking with rubber-band past boundaries
 * - Momentum projection decides the landing snap
 * - Release velocity is handed off to the spring (no seam between drag and animation)
 * - Backdrop opacity is bound to sheet position; tap or Android-back dismisses
 */
export const NexGBottomSheet = ({
  open,
  onClose,
  snapPoints = [0.55],
  title,
  children,
}: NexGBottomSheetProps) => {
  const { colors, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(open);
  /** Guards against a second onClose firing while the exit spring is running. */
  const closing = useRef(false);

  const snaps = snapPoints.length > 0 ? snapPoints : [0.55];
  const maxSnap = snaps[snaps.length - 1];
  const sheetHeight = maxSnap * WINDOW_HEIGHT;
  /** translateY: 0 = fully raised at max snap · sheetHeight = fully off-screen */
  const translateY = useSharedValue(sheetHeight);

  const snapOffset = (fraction: number) => (maxSnap - fraction) * WINDOW_HEIGHT;

  useEffect(() => {
    if (open) {
      closing.current = false;
      setMounted(true);
      translateY.value = withSpring(snapOffset(snaps[0]), SHEET_SPRING);
    } else if (mounted) {
      translateY.value = withSpring(
        sheetHeight + 60,
        { ...SHEET_SPRING, damping: 42 },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, onClose]);

  const close = () => onClose();

  const dragStart = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .onStart(() => {
      dragStart.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = dragStart.value + e.translationY;
      if (next < 0) {
        translateY.value = -rubberband(-next, sheetHeight);
      } else if (next > sheetHeight) {
        translateY.value = sheetHeight + rubberband(next - sheetHeight, sheetHeight);
      } else {
        translateY.value = next;
      }
    })
    .onEnd((e) => {
      'worklet';
      const projected = translateY.value + project(e.velocityY);
      if (e.velocityY > 900 || projected > sheetHeight * 0.72) {
        if (closing.current) return;
        closing.current = true;
        translateY.value = withSpring(
          sheetHeight + 60,
          { ...SHEET_SPRING, damping: 42, velocity: e.velocityY },
          (finished) => {
            if (finished) runOnJS(close)();
          }
        );
        return;
      }
      let target = snapOffset(snaps[0]);
      let best = Math.abs(projected - target);
      for (const snap of snaps) {
        const offset = snapOffset(snap);
        const dist = Math.abs(projected - offset);
        if (dist < best) {
          best = dist;
          target = offset;
        }
      }
      translateY.value = withSpring(target, { ...SHEET_SPRING, velocity: e.velocityY });
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeight], [1, 0]),
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible onRequestClose={onClose} animationType="none" statusBarTranslucent>
      {/* Android renders Modal content in a separate window: without its own
          root view, RNGH gestures never attach and dismissal falls through
          to the system back handler (which can exit the app). */}
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'auto' : 'none'}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]}>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              onPress={onClose}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <GestureDetector gesture={pan}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  height: sheetHeight,
                  backgroundColor: colors.surface.primary,
                  borderTopLeftRadius: radii.sheet,
                  borderTopRightRadius: radii.sheet,
                  paddingBottom: insets.bottom,
                },
                sheetStyle,
              ]}>
              <View style={styles.dragZone}>
                <View style={[styles.grabber, { backgroundColor: colors.border.strong }]} />
                {title ? (
                  <NexGText variant="heading" style={{ marginTop: spacing.md }}>
                    {title}
                  </NexGText>
                ) : null}
              </View>
              <View style={styles.content}>{children}</View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    ...StyleSheet.absoluteFill,
    top: 'auto',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  dragZone: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
