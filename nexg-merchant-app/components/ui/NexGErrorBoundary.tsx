// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary — last line of defense so a malformed item can never black out
 * the whole screen. If a child render throws, we surface a graceful fallback
 * with a way back instead of a blank/black modal.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surfaced in dev; in production this keeps the app usable.
    console.warn('[NexG] Item experience error:', error?.message, info?.componentStack?.slice(0, 400));
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <NexGText variant="heading" style={{ marginBottom: 8 }}>
            We couldn't show this
          </NexGText>
          <NexGText variant="body" color="muted" style={{ marginBottom: 16, textAlign: 'center' }}>
            {this.props.fallbackMessage ?? 'This item has a problem. Please try another.'}
          </NexGText>
          <NexGButton label="Go back" variant="secondary" size="medium" onPress={this.reset} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 4,
  },
});