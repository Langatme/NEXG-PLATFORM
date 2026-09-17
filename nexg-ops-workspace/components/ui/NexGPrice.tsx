import { formatKes } from '@/utils/money';
import React from 'react';
import { NexGText } from './NexGText';

interface NexGPriceProps {
  amountKes: number;
  variant?: 'body' | 'bodyStrong' | 'heading' | 'numeric' | 'title' | 'label' | 'caption';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
}

export const NexGPrice = ({ amountKes, variant = 'numeric', color = 'primary' }: NexGPriceProps) => (
  <NexGText variant={variant} color={color} style={{ fontVariant: ['tabular-nums'] }}>
    {formatKes(amountKes)}
  </NexGText>
);
