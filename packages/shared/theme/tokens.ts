export const lightPalette = {  background: {
    primary: '#F6F6F4',
    secondary: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  surface: {
    primary: '#FFFFFF',
    secondary: '#EFEFEA',
    inverse: '#17171B',
  },
  text: {
    primary: '#131316',
    secondary: '#4B4B52',
    muted: '#8A8A92',
    inverse: '#FFFFFF',
    onAction: '#FFFFFF',
  },
  border: {
    subtle: '#E7E7E2',
    strong: '#D6D6D0',
  },
  action: {
    primary: '#17171B',
    primaryPressed: '#2E2E34',
    secondary: '#EDEDE9',
    ghost: 'transparent',
  },
  accent: {
    primary: '#00A26B',
    soft: '#E3F5ED',
  },
  status: {
    success: '#12855F',
    successSoft: '#E3F5ED',
    warning: '#B45309',
    warningSoft: '#FCF0DD',
    error: '#D92D20',
    errorSoft: '#FDEBE9',
    info: '#175CD3',
    infoSoft: '#EAF1FD',
    neutral: '#5A5A62',
    neutralSoft: '#ECECE8',
  },
  overlay: 'rgba(19, 19, 22, 0.45)',
};

export const darkPalette = {
  background: {
    primary: '#0D0D10',
    secondary: '#16161A',
    elevated: '#1C1C21',
  },
  surface: {
    primary: '#16161A',
    secondary: '#222228',
    inverse: '#F5F5F7',
  },
  text: {
    primary: '#F5F5F7',
    secondary: '#C7C7CE',
    muted: '#8E8E96',
    inverse: '#101013',
    onAction: '#101013',
  },
  border: {
    subtle: '#2A2A31',
    strong: '#3A3A43',
  },
  action: {
    primary: '#F5F5F7',
    primaryPressed: '#DADAE0',
    secondary: '#26262D',
    ghost: 'transparent',
  },
  accent: {
    primary: '#2BD99F',
    soft: '#12352A',
  },
  status: {
    success: '#3CCB91',
    successSoft: '#12352A',
    warning: '#F5A524',
    warningSoft: '#3A2A10',
    error: '#F97066',
    errorSoft: '#3B1512',
    info: '#6EA8FE',
    infoSoft: '#14294A',
    neutral: '#9A9AA3',
    neutralSoft: '#26262D',
  },
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export interface Palette {
  background: { primary: string; secondary: string; elevated: string };
  surface: { primary: string; secondary: string; inverse: string };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    onAction: string;
  };
  border: { subtle: string; strong: string };
  action: {
    primary: string;
    primaryPressed: string;
    secondary: string;
    ghost: string;
  };
  accent: { primary: string; soft: string };
  status: {
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    error: string;
    errorSoft: string;
    info: string;
    infoSoft: string;
    neutral: string;
    neutralSoft: string;
  };
  overlay: string;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  small: 10,
  medium: 14,
  large: 20,
  sheet: 24,
  pill: 999,
} as const;

export const fontFamilies = {
  regular: 'Nunito_400Regular',
  bold: 'Nunito_700Bold',
  black: 'Nunito_900Black',
} as const;

export const typeScale = {
  display: { fontSize: 32, lineHeight: 38 },
  title: { fontSize: 24, lineHeight: 30 },
  heading: { fontSize: 18, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  numeric: { fontSize: 15, lineHeight: 20 },
} as const;
