// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/card.tsx).
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { memo, type ReactNode } from 'react';
import {
  TextProps as RNTextProps,
  TextStyle,
  View,
  ViewProps as RNViewProps,
  ViewStyle,
} from 'react-native';

export interface NexGCardProps extends RNViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const NexGCard = memo(function NexGCard({
  children,
  style,
  ...props
}: NexGCardProps) {
  const { colors, radii } = useTheme();

  return (
    <View
      style={[
        {
          width: '100%',
          backgroundColor: colors.surface.primary,
          borderRadius: radii.large,
          padding: 18,
          shadowColor: colors.text.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

export interface NexGCardHeaderProps extends RNViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const NexGCardHeader = memo(function NexGCardHeader({
  children,
  style,
  ...props
}: NexGCardHeaderProps) {
  const { spacing } = useTheme();

  return (
    <View style={[{ marginBottom: spacing.sm }, style]} {...props}>
      {children}
    </View>
  );
});

export interface NexGCardTitleProps extends RNTextProps {
  children: ReactNode;
  style?: TextStyle;
}

export const NexGCardTitle = memo(function NexGCardTitle({
  children,
  style,
  ...props
}: NexGCardTitleProps) {
  const { spacing } = useTheme();

  return (
    <NexGText
      variant="title"
      style={[{ marginBottom: spacing.xs }, style]}
      {...props}
    >
      {children}
    </NexGText>
  );
});

export interface NexGCardDescriptionProps extends RNTextProps {
  children: ReactNode;
  style?: TextStyle;
}

export const NexGCardDescription = memo(function NexGCardDescription({
  children,
  style,
  ...props
}: NexGCardDescriptionProps) {
  return (
    <NexGText variant="caption" style={[style]} {...props}>
      {children}
    </NexGText>
  );
});

export interface NexGCardContentProps extends RNViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const NexGCardContent = memo(function NexGCardContent({
  children,
  style,
  ...props
}: NexGCardContentProps) {
  return (
    <View style={[style]} {...props}>
      {children}
    </View>
  );
});

export interface NexGCardFooterProps extends RNViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const NexGCardFooter = memo(function NexGCardFooter({
  children,
  style,
  ...props
}: NexGCardFooterProps) {
  const { spacing } = useTheme();

  return (
    <View
      style={[
        {
          marginTop: spacing.lg,
          flexDirection: 'row',
          gap: 8,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});
