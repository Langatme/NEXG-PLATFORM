import { useTheme } from '@/theme';
import React from 'react';
import { AutoSkeletonView, AutoSkeletonIgnoreView } from 'react-native-auto-skeleton';

interface NexGSkeletonViewProps {
  isLoading: boolean;
  children: React.ReactNode;
  animationType?: 'gradient' | 'pulse' | 'none';
  shimmerSpeed?: number;
}

/**
 * Themed wrapper around react-native-auto-skeleton's AutoSkeletonView.
 * Provides NEXG-consistent skeleton colors that adapt to light/dark mode.
 */
export const NexGSkeletonView = ({
  isLoading,
  children,
  animationType = 'pulse',
  shimmerSpeed = 1.0,
}: NexGSkeletonViewProps) => {
  const { colors } = useTheme();

  return (
    <AutoSkeletonView
      isLoading={isLoading}
      animationType={animationType}
      shimmerSpeed={shimmerSpeed}
      shimmerBackgroundColor={colors.surface.secondary}
      defaultRadius={14}
    >
      {children}
    </AutoSkeletonView>
  );
};

export { AutoSkeletonIgnoreView };
