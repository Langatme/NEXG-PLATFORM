import { fontFamilies, typeScale } from './tokens';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'numeric';

export const textVariants = {
  display: { ...typeScale.display, fontFamily: fontFamilies.black, fontWeight: '900' },
  title: { ...typeScale.title, fontFamily: fontFamilies.black, fontWeight: '900' },
  heading: { ...typeScale.heading, fontFamily: fontFamilies.bold, fontWeight: '700' },
  body: { ...typeScale.body, fontFamily: fontFamilies.regular },
  bodyStrong: { ...typeScale.body, fontFamily: fontFamilies.bold, fontWeight: '700' },
  label: { ...typeScale.label, fontFamily: fontFamilies.bold, fontWeight: '600' },
  caption: { ...typeScale.caption, fontFamily: fontFamilies.regular },
  numeric: { ...typeScale.numeric, fontFamily: fontFamilies.bold, fontWeight: '700' },
} as const satisfies Record<
  TextVariant,
  { fontSize: number; lineHeight: number; fontFamily: string; fontWeight?: '400' | '600' | '700' | '900' }
>;
