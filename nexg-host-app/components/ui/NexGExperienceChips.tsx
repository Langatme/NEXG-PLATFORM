// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Slice 3 (login-guest): multi-select experience chip row. Single-selection
// source of truth is EXPERIENCE_PREFERENCES (domain/experiencePreferences);
// this component only renders + toggles. Used in profile-setup onboarding
// and the account Preferences screen. Chrome icons come from the shared
// PreferenceIconMap below (Ionicons, not emoji) — the emoji domain field
// stays untouched for non-chrome surfaces (search, notifications).
import { EXPERIENCE_PREFERENCES } from '@/domain/experiencePreferences';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, ViewStyle } from 'react-native';
import { NexGChip } from './NexGChip';

/** Owner contract: chrome icon per experience id (Ionicons glyph names, never emoji). */
export interface PreferenceIconMap {
  [id: string]: keyof typeof Ionicons.glyphMap;
}

/** Chrome icons for the experience selector (Ionicons, not emoji). */
const PREFERENCE_ICONS: PreferenceIconMap = {
  food: 'fast-food-outline',
  wellness: 'leaf-outline',
  beauty: 'sparkles-outline',
  experiences: 'ticket-outline',
  transport: 'car-outline',
  shopping: 'bag-outline',
  events: 'calendar-outline',
  services: 'construct-outline',
  stay: 'bed-outline',
  offers: 'pricetag-outline',
};

interface NexGExperienceChipsProps {
  selected: string[];
  onToggle: (id: string) => void;
  /** Optional per-chip counts (e.g. places nearby). */
  counts?: Partial<Record<string, number>>;
  style?: ViewStyle;
  testID?: string;
}

export const NexGExperienceChips = ({
  selected,
  onToggle,
  counts,
  style,
  testID,
}: NexGExperienceChipsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ gap: 8, paddingEnd: 24 }, style]}
      testID={testID}>
      {EXPERIENCE_PREFERENCES.map((pref) => {
        const count = counts?.[pref.id];
        const label =
          count === undefined ? pref.label : `${pref.label} · ${count}`;
        return (
          <NexGChip
            key={pref.id}
            label={label}
            icon={PREFERENCE_ICONS[pref.id]}
            selected={selected.includes(pref.id)}
            onPress={() => onToggle(pref.id)}
          />
        );
      })}
    </ScrollView>
  );
};
