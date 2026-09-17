// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/carousel.tsx).
// Adaptations: NexG tokens via useTheme (surface/border/accent, radii.large/pill);
// expo-blur arrows replaced with solid themed surface (outside import allowlist);
// lucide chevrons rendered directly. Behavior preserved: snap/loop/autoplay API,
// imperative ref, indicators, a11y selected/disabled states.
import { useTheme } from '@/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export interface NexGCarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  itemWidth?: number;
  spacing?: number;
  style?: ViewStyle;
  onIndexChange?: (index: number) => void;
}

export interface NexGCarouselItemProps {
  children: React.ReactNode;
  style?: ViewStyle[] | ViewStyle;
}

export interface NexGCarouselContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface NexGCarouselIndicatorsProps {
  total: number;
  current: number;
  onPress?: (index: number) => void;
  style?: ViewStyle;
}

export interface NexGCarouselArrowProps {
  direction: 'left' | 'right';
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

// Define the ref interface
export interface NexGCarouselRef {
  goToSlide: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  getCurrentIndex: () => number;
}

// Main Carousel Component
export const NexGCarousel = forwardRef<NexGCarouselRef, NexGCarouselProps>(
  (
    {
      children,
      autoPlay = false,
      autoPlayInterval = 3000,
      showIndicators = true,
      showArrows = false,
      loop = false,
      itemWidth,
      spacing = 0,
      style,
      onIndexChange,
    },
    ref
  ) => {
    const { spacing: tokens } = useTheme();
    const { width: screenWidth } = useWindowDimensions();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(screenWidth);
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    // Use useRef to store timer ID and prevent stale closures
    const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentIndexRef = useRef(currentIndex); // Keep ref in sync for auto play

    // Update ref when currentIndex changes
    useEffect(() => {
      currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    // Calculate slide dimensions
    const slideWidth = itemWidth || containerWidth - spacing * 2;
    const snapToInterval = slideWidth + spacing;

    // Clear all timers
    const clearTimers = useCallback(() => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    }, []);

    // Scroll to current index
    const scrollToIndex = useCallback(
      (index: number, animated: boolean = true) => {
        if (scrollViewRef.current && index >= 0 && index < children.length) {
          const scrollX = index * snapToInterval;

          // Use requestAnimationFrame to ensure smooth scrolling
          requestAnimationFrame(() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({
                x: scrollX,
                animated,
              });
            }
          });
        }
      },
      [snapToInterval, children.length]
    );

    // Navigation functions
    const goToSlide = useCallback(
      (index: number) => {
        if (index >= 0 && index < children.length && index !== currentIndex) {
          setCurrentIndex(index);
          setIsUserInteracting(true);
          scrollToIndex(index);

          // Clear auto play timeout to prevent conflicts
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
          }
        }
      },
      [children.length, scrollToIndex, currentIndex]
    );

    const goToNext = useCallback(() => {
      const nextIndex = currentIndexRef.current + 1;
      const targetIndex =
        nextIndex < children.length
          ? nextIndex
          : loop
            ? 0
            : currentIndexRef.current;
      if (targetIndex !== currentIndexRef.current) {
        setCurrentIndex(targetIndex);
        setIsUserInteracting(true);
        scrollToIndex(targetIndex);

        // Clear auto play timeout to prevent conflicts
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
    }, [children.length, loop, scrollToIndex]);

    const goToPrevious = useCallback(() => {
      const prevIndex = currentIndexRef.current - 1;
      const targetIndex =
        prevIndex >= 0
          ? prevIndex
          : loop
            ? children.length - 1
            : currentIndexRef.current;
      if (targetIndex !== currentIndexRef.current) {
        setCurrentIndex(targetIndex);
        setIsUserInteracting(true);
        scrollToIndex(targetIndex);

        // Clear auto play timeout to prevent conflicts
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
    }, [loop, children.length, scrollToIndex]);

    // Expose methods through ref
    useImperativeHandle(
      ref,
      () => ({
        goToSlide,
        goToNext,
        goToPrevious,
        getCurrentIndex: () => currentIndex,
      }),
      [goToSlide, goToNext, goToPrevious, currentIndex]
    );

    // Start auto play - Fixed to actually scroll the view
    const startAutoPlay = useCallback(() => {
      if (!autoPlay || children.length <= 1 || isUserInteracting) return;

      clearTimers();

      autoPlayTimerRef.current = setInterval(() => {
        const nextIndex = currentIndexRef.current + 1;
        const targetIndex =
          nextIndex >= children.length
            ? loop
              ? 0
              : currentIndexRef.current
            : nextIndex;

        if (targetIndex !== currentIndexRef.current) {
          // Update state and scroll to new position
          setCurrentIndex(targetIndex);
          scrollToIndex(targetIndex, true);
        }
      }, autoPlayInterval);
    }, [
      autoPlay,
      autoPlayInterval,
      children.length,
      loop,
      isUserInteracting,
      clearTimers,
      scrollToIndex,
    ]);

    // Stop auto play
    const stopAutoPlay = useCallback(() => {
      clearTimers();
    }, [clearTimers]);

    // Handle auto play lifecycle
    useEffect(() => {
      if (autoPlay && !isUserInteracting) {
        startAutoPlay();
      } else {
        stopAutoPlay();
      }

      return stopAutoPlay;
    }, [autoPlay, isUserInteracting, startAutoPlay, stopAutoPlay]);

    // Handle index changes - notify parent component with debouncing
    useEffect(() => {
      // Use a small delay to prevent rapid-fire updates during navigation
      const timeoutId = setTimeout(() => {
        onIndexChange?.(currentIndex);
      }, 50);

      return () => clearTimeout(timeoutId);
    }, [currentIndex, onIndexChange]);

    // Handle scroll events - only update index from user scrolling
    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Only update index from scroll if user is manually scrolling
        if (isUserInteracting) {
          const scrollPosition = event.nativeEvent.contentOffset.x;
          const index = Math.round(scrollPosition / snapToInterval);

          if (index !== currentIndex && index >= 0 && index < children.length) {
            setCurrentIndex(index);
          }
        }
      },
      [currentIndex, snapToInterval, children.length, isUserInteracting]
    );

    // Handle momentum scroll end
    const handleMomentumScrollEnd = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / snapToInterval);

        // Update index based on final scroll position
        if (index >= 0 && index < children.length && index !== currentIndex) {
          setCurrentIndex(index);
        }

        // Re-enable auto play after user interaction ends
        if (autoPlay) {
          scrollTimeoutRef.current = setTimeout(() => {
            setIsUserInteracting(false);
          }, 1000);
        }
      },
      [snapToInterval, children.length, autoPlay, currentIndex]
    );

    // Touch handlers
    const handleTouchStart = useCallback(() => {
      setIsUserInteracting(true);
    }, []);

    const handleTouchEnd = useCallback(() => {
      // Don't immediately re-enable auto play, let momentum scroll end handle it
    }, []);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        clearTimers();
      };
    }, [clearTimers]);

    const horizontalPan = Gesture.Pan()
      .onBegin(() => {
        // Optional: trigger when gesture starts
      })
      .onUpdate(() => {
        // Optional: you can track gesture updates here
      })
      .onEnd(() => {
        // Optional: trigger when gesture ends
      })
      .activeOffsetX([-10, 10]) // Allow horizontal pan
      .activeOffsetY([-1000, 1000]); // Block vertical gesture

    return (
      <View
        style={[
          {
            width: '100%',
            minWidth: itemWidth ? itemWidth + spacing * 2 : '100%',
          },
          style,
        ]}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          // Ensure we have a valid width
          if (width > 0) {
            setContainerWidth(width);
          }
        }}
      >
        <View style={{ position: 'relative', overflow: 'hidden' }}>
          <GestureDetector gesture={horizontalPan}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled={!itemWidth}
              snapToInterval={itemWidth ? snapToInterval : undefined}
              snapToAlignment={itemWidth ? 'start' : 'center'}
              decelerationRate={itemWidth ? 'fast' : 'normal'}
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              scrollEventThrottle={16}
              bounces={false}
              contentContainerStyle={
                itemWidth
                  ? {
                      paddingHorizontal: spacing,
                      paddingEnd: Math.max(spacing, 24),
                    }
                  : {
                      width: children.length * containerWidth,
                    }
              }
            >
              {children.map((child, index) => (
                <View
                  key={index}
                  style={{
                    width: slideWidth,
                    marginRight: itemWidth ? spacing : 0,
                  }}
                >
                  {child}
                </View>
              ))}
            </ScrollView>
          </GestureDetector>

          {showArrows && children.length > 1 && (
            <>
              <NexGCarouselArrow
                direction="left"
                onPress={goToPrevious}
                disabled={!loop && currentIndex === 0}
                style={{
                  position: 'absolute',
                  left: 6,
                  top: '50%',
                  transform: [{ translateY: -12 }],
                  zIndex: 10,
                }}
              />
              <NexGCarouselArrow
                direction="right"
                onPress={goToNext}
                disabled={!loop && currentIndex === children.length - 1}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: [{ translateY: -12 }],
                  zIndex: 10,
                }}
              />
            </>
          )}
        </View>

        {showIndicators && children.length > 1 && (
          <NexGCarouselIndicators
            total={children.length}
            current={currentIndex}
            onPress={goToSlide}
            style={{
              marginTop: tokens.md,
              alignSelf: 'center',
            }}
          />
        )}
      </View>
    );
  }
);

NexGCarousel.displayName = 'NexGCarousel';

// Carousel Content Component
export function NexGCarouselContent({
  children,
  style,
}: NexGCarouselContentProps) {
  return <View style={style}>{children}</View>;
}

// Carousel Item Component - Auto height to fit content
export function NexGCarouselItem({ children, style }: NexGCarouselItemProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface.primary,
          borderRadius: radii.large,
          borderWidth: 1,
          borderColor: colors.border.subtle,
          padding: spacing.lg,
          minHeight: 200, // Keep minimum height for consistency
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Carousel Indicators Component
export function NexGCarouselIndicators({
  total,
  current,
  onPress,
  style,
}: NexGCarouselIndicatorsProps) {
  const { colors, radii } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
        },
        style,
      ]}
    >
      {Array.from({ length: total }, (_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onPress?.(index)}
          style={{
            width: 8,
            height: 8,
            borderRadius: radii.pill,
            backgroundColor:
              index === current
                ? colors.accent.primary
                : colors.border.strong,
          }}
          hitSlop={{ top: 18, bottom: 18, left: 3, right: 3 }}
          accessibilityRole="button"
          accessibilityLabel={`Go to slide ${index + 1} of ${total}`}
          accessibilityState={{ selected: index === current }}
        />
      ))}
    </View>
  );
}

// Carousel Arrow Component
export function NexGCarouselArrow({
  direction,
  onPress,
  disabled = false,
  style,
}: NexGCarouselArrowProps) {
  const { colors, radii } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          width: 24,
          height: 24,
          borderRadius: radii.pill,
          overflow: 'hidden',
          opacity: disabled ? 0.3 : 1,
          backgroundColor: colors.surface.primary,
          borderWidth: 1,
          borderColor: colors.border.subtle,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        direction === 'left' ? 'Previous slide' : 'Next slide'
      }
      accessibilityState={{ disabled }}
    >
      {direction === 'left' ? (
        <ChevronLeft size={20} color={colors.accent.primary} />
      ) : (
        <ChevronRight size={20} color={colors.accent.primary} />
      )}
    </TouchableOpacity>
  );
}
