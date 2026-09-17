// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Slice 3 (login-guest): multi-select experience chip row. Single-selection
// source of truth is EXPERIENCE_PREFERENCES (domain/experiencePreferences);
// this component only renders + toggles. Used in profile-setup onboarding
// and the account Preferences screen.
import { EXPERIENCE_PREFERENCES } from '@/domain/experiencePreferences';
import React from 'react';
import { ScrollView, ViewStyle } from 'react-native';
import { NexGChip } from './NexGChip';

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
          count === undefined ? `${pref.emoji} ${pref.label}` : `${pref.emoji} ${pref.label} · ${count}`;
        return (
          <NexGChip
            key={pref.id}
            label={label}
            selected={selected.includes(pref.id)}
            onPress={() => onToggle(pref.id)}
          />
        );
      })}
    </ScrollView>
  );
};
