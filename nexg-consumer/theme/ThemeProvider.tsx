// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import useUserStore from '@/hooks/use-userstore';
import { darkPalette, lightPalette, radii, spacing, type Palette } from './tokens';
import { textVariants, TextVariant } from './typography';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeValue {
  mode: 'light' | 'dark';
  colors: Palette;
  spacing: typeof spacing;
  radii: typeof radii;
  text: (variant: TextVariant) => (typeof textVariants)[TextVariant];
}

const ThemeContext = createContext<ThemeValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const scheme = useColorScheme();
  const themePref = useUserStore((s) => s.themePreference);

  const value = useMemo<ThemeValue>(() => {
    const mode = themePref === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : themePref;
    const colors = mode === 'dark' ? darkPalette : lightPalette;
    return {
      mode,
      colors,
      spacing,
      radii,
      text: (variant: TextVariant) => textVariants[variant],
    };
  }, [scheme, themePref]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
