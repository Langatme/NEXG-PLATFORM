// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Page A epic: universal item sheet shell over ResolvedItemExperience.
import type { ExperienceSectionId, ResolvedItemExperience } from '@/domain/itemExperience';
import type { CatalogItem } from '@/domain/types';
import { useTheme } from '@/theme';
import { formatKes } from '@/utils/money';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from './NexGButton';
import { NexGCard } from './NexGCard';
import { NexGCheckbox } from './NexGCheckbox';
import { NexGInput } from './NexGInput';
import { NexGPrice } from './NexGPrice';
import { NexGQuantitySelector } from './NexGQuantitySelector';
import { NexGRadioGroup } from './NexGRadio';
import { NexGText } from './NexGText';

export interface NexGItemSheetSelection {
  unitCount: number;
  variantId: string | null;
  addonIds: string[];
  instructions: string;
  dateIso: string | null;
  totalKes: number;
  configLabel?: string;
}

export interface NexGItemSheetProps {
  experience: ResolvedItemExperience;
  media?: React.ReactNode;
  related?: CatalogItem[];
  onRelatedPress?: (item: CatalogItem) => void;
  onMerchantPress?: () => void;
  ctaState?: 'idle' | 'added';
  addedCtaLabel?: string;
  onAction: (sel: NexGItemSheetSelection) => void;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function NexGItemSheet({
  experience,
  media,
  related,
  onRelatedPress,
  onMerchantPress,
  ctaState = 'idle',
  addedCtaLabel = 'View cart',
  onAction,
}: NexGItemSheetProps): React.ReactElement {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const config = experience.configuration;

  const activeRule = config.quantity ?? config.participants ?? config.rentalDays;
  const activeMin = activeRule?.min ?? 1;
  const activeMax = activeRule?.max ?? 99;

  const [unitCount, setUnitCount] = useState<number>(() =>
    clamp(activeRule?.min ?? 1, activeRule?.min ?? 1, activeRule?.max ?? 99),
  );
  const [variantId, setVariantId] = useState<string | null>(config.variants?.[0]?.id ?? null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [dateIso, setDateIso] = useState<string | null>(config.dates?.[0]?.iso ?? null);

  const selectedVariant = config.variants?.find((v) => v.id === variantId) ?? null;
  const variantDelta = selectedVariant?.priceDeltaKes ?? 0;
  const selectedAddons = useMemo(
    () => (config.addons ?? []).filter((a) => addonIds.includes(a.id)),
    [config.addons, addonIds],
  );
  const addonsSum = selectedAddons.reduce((s, a) => s + (a.priceKes ?? a.priceDeltaKes ?? 0), 0);
  const totalKes =
    (experience.price.baseKes + variantDelta + addonsSum) *
    (experience.multiplier === 'fixed' ? 1 : unitCount);

  const configLabel: string | undefined = useMemo(() => {
    const parts = [
      ...(selectedVariant ? [selectedVariant.label] : []),
      ...selectedAddons.map((a) => a.label),
    ];
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }, [selectedVariant, selectedAddons]);

  const selection: NexGItemSheetSelection = {
    unitCount,
    variantId,
    addonIds,
    instructions,
    dateIso,
    totalKes,
    configLabel,
  };

  const ctaLabel = ctaState === 'added' ? addedCtaLabel : experience.action.label;
  const ctaDisabled = experience.requiresScheduling && !dateIso;

  const stepUnit = (delta: number, min: number, max: number): void => {
    setUnitCount((c) => clamp(c + delta, min, max));
  };

  const toggleAddon = (id: string): void => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderUnitControl = (
    min: number,
    max: number,
    label: string | null,
    a11y: string,
  ): React.ReactElement => (
    <View style={styles.unitRow} accessibilityLabel={a11y}>
      {label ? (
        <NexGText variant="label" accessibilityLabel={label}>
          {label}
        </NexGText>
      ) : null}
      <NexGQuantitySelector
        quantity={unitCount}
        onIncrement={() => stepUnit(1, min, max)}
        onDecrement={() => stepUnit(-1, min, max)}
      />
    </View>
  );

  const renderSection = (section: ExperienceSectionId): React.ReactElement | null => {
    switch (section) {
      case 'identity':
      case 'reputation':
      case 'attributes':
      case 'description':
      case 'about':
        return null;
      case 'variants': {
        if (!config.variants || config.variants.length === 0) return null;
        return (
          <View key={section} style={styles.section}>
            <NexGText variant="bodyStrong" accessibilityRole="header">
              {config.variantsLabel ?? 'Options'}
            </NexGText>
            <NexGRadioGroup
              options={config.variants.map((v) => ({
                value: v.id,
                label:
                  v.priceDeltaKes && v.priceDeltaKes > 0
                    ? `${v.label} +${formatKes(v.priceDeltaKes)}`
                    : v.label,
              }))}
              value={variantId ?? undefined}
              onValueChange={(v) => setVariantId(v)}
            />
          </View>
        );
      }
      case 'quantity': {
        if (!config.quantity) return null;
        return (
          <View key={section} style={styles.section}>
            {renderUnitControl(
              config.quantity.min,
              config.quantity.max,
              experience.unit || 'Qty',
              `Quantity ${unitCount}`,
            )}
          </View>
        );
      }
      case 'participants': {
        if (!config.participants) return null;
        return (
          <View key={section} style={styles.section}>
            {renderUnitControl(
              config.participants.min,
              config.participants.max,
              experience.unit || 'Guests',
              `Guests ${unitCount}`,
            )}
          </View>
        );
      }
      case 'rental': {
        if (!config.rentalDays) return null;
        return (
          <View key={section} style={styles.section}>
            {renderUnitControl(
              config.rentalDays.min,
              config.rentalDays.max,
              experience.unit || 'Days',
              `Days ${unitCount}`,
            )}
          </View>
        );
      }
      case 'add_ons': {
        if (!config.addons || config.addons.length === 0) return null;
        return (
          <View key={section} style={styles.section}>
            <NexGText variant="bodyStrong" accessibilityRole="header">
              {config.addonsLabel ?? 'Add-ons'}
            </NexGText>
            {config.addons.map((a) => {
              const price = a.priceKes ?? a.priceDeltaKes ?? 0;
              const label = price > 0 ? `${a.label} +${formatKes(price)}` : a.label;
              return (
                <NexGCheckbox
                  key={a.id}
                  checked={addonIds.includes(a.id)}
                  label={label}
                  accessibilityLabel={label}
                  onCheckedChange={() => toggleAddon(a.id)}
                />
              );
            })}
          </View>
        );
      }
      case 'instructions': {
        if (!config.instructions) return null;
        return (
          <View key={section} style={styles.section}>
            <NexGInput
              placeholder={config.instructions.placeholder}
              value={instructions}
              onChangeText={setInstructions}
              accessibilityLabel="Special instructions"
            />
          </View>
        );
      }
      case 'date': {
        if (!config.dates || config.dates.length === 0) return null;
        return (
          <View key={section} style={styles.section}>
            <NexGText variant="bodyStrong" accessibilityRole="header">
              Date
            </NexGText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.railContent}>
              {config.dates.map((d) => {
                const selected = d.iso === dateIso;
                return (
                  <Pressable
                    key={d.iso}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${d.weekday} ${d.label}`}
                    onPress={() => setDateIso(d.iso)}
                    style={[
                      styles.dateChip,
                      {
                        borderRadius: radii.pill,
                        backgroundColor: selected
                          ? colors.surface.inverse
                          : colors.surface.primary,
                        borderColor: colors.border.subtle,
                      },
                    ]}>
                    <NexGText
                      variant="bodyStrong"
                      style={{ color: selected ? colors.text.inverse : colors.text.primary }}>
                      {d.label}
                    </NexGText>
                    <NexGText
                      variant="caption"
                      style={{ color: selected ? colors.text.inverse : colors.text.muted }}>
                      {d.weekday}
                    </NexGText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        );
      }
      case 'time':
      case 'duration':
      case 'location':
      case 'pickup':
      case 'dropoff':
      case 'delivery':
        return null;
      case 'availability': {
        if (!config.availability || config.availability.length === 0) return null;
        return (
          <View key={section} style={styles.section}>
            <NexGText variant="bodyStrong" accessibilityRole="header">
              Availability
            </NexGText>
            {config.availability.map((s) => (
              <View
                key={s.id}
                style={styles.sessionRow}
                accessibilityLabel={`${s.title}, ${s.timeLabel}`}>
                <NexGText variant="bodyStrong">{s.title}</NexGText>
                <NexGText variant="caption" color="muted">
                  {s.timeLabel}
                  {s.seatsLeft != null ? ` · ${s.seatsLeft} seats left` : ''}
                </NexGText>
                <NexGText variant="body">{`From ${formatKes(s.priceFromKes)}`}</NexGText>
              </View>
            ))}
          </View>
        );
      }
      case 'included': {
        if (!config.included || config.included.length === 0) return null;
        return (
          <View key={section} style={styles.section}>
            <NexGText variant="bodyStrong" accessibilityRole="header">
              Included
            </NexGText>
            {config.included.map((t, i) => (
              <NexGText key={`${i}-${t}`} variant="body">
                {`• ${t}`}
              </NexGText>
            ))}
          </View>
        );
      }
      case 'policies': {
        if (!config.policies || config.policies.length === 0) return null;
        return (
          <View key={section} style={styles.section}>
            <NexGText variant="bodyStrong" accessibilityRole="header">
              Policies
            </NexGText>
            {config.policies.map((t, i) => (
              <NexGText key={`${i}-${t}`} variant="body">
                {`• ${t}`}
              </NexGText>
            ))}
          </View>
        );
      }
      case 'merchant': {
        if (!experience.merchant) return null;
        const merchantCard = (
          <NexGCard>
            <NexGText variant="bodyStrong">{experience.merchant.name}</NexGText>
            <NexGText variant="caption" color="muted">
              {experience.merchant.categoryLabel}
            </NexGText>
          </NexGCard>
        );
        return (
          <View key={section} style={styles.section}>
            {onMerchantPress ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View ${experience.merchant.name}`}
                onPress={onMerchantPress}>
                {merchantCard}
              </Pressable>
            ) : (
              merchantCard
            )}
          </View>
        );
      }
      case 'related': {
        if (!related || related.length === 0) return null;
        return (
          <View key={section} style={styles.section}>
            <NexGText variant="bodyStrong" accessibilityRole="header">
              Related
            </NexGText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.railContent}>
              {related.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  onPress={() => onRelatedPress?.(item)}
                  style={[
                    styles.relatedCard,
                    {
                      borderRadius: radii.large,
                      backgroundColor: colors.surface.primary,
                      borderColor: colors.border.subtle,
                    },
                  ]}>
                  <NexGText variant="body" numberOfLines={1}>
                    {item.name}
                  </NexGText>
                  <NexGPrice amountKes={item.priceKes} variant="caption" color="secondary" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        );
      }
      default:
        return null;
    }
  };

  const fixedDateOption = config.dates?.find((d) => d.iso === dateIso) ?? null;
  const fixedDateLabel = fixedDateOption
    ? `${fixedDateOption.weekday} ${fixedDateOption.label}`
    : (dateIso?.slice(5) ?? null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 148 },
        ]}>
        {media ? <View style={styles.media}>{media}</View> : null}

        <View style={styles.section}>
          <NexGText variant="heading" accessibilityRole="header">
            {`${experience.identity.emoji} ${experience.identity.title}`}
          </NexGText>
          <NexGText variant="caption" color="muted">
            {experience.identity.categoryLabel}
          </NexGText>
          {experience.identity.badges.length > 0 ? (
            <View style={styles.badgeRow}>
              {experience.identity.badges.map((b) => (
                <View
                  key={b}
                  style={[
                    styles.badge,
                    { borderRadius: radii.pill, backgroundColor: colors.surface.secondary },
                  ]}>
                  <NexGText variant="caption">{b}</NexGText>
                </View>
              ))}
            </View>
          ) : null}
          {experience.price.perLabel ? (
            <NexGText variant="body" color="secondary">
              {`${formatKes(experience.price.baseKes)} ${experience.price.perLabel}`}
            </NexGText>
          ) : null}
        </View>

        {experience.reputation.reviewCount > 0 ? (
          <View style={styles.section}>
            <NexGText
              variant="body"
              accessibilityLabel={`Rated ${experience.reputation.rating} from ${experience.reputation.reviewCount} reviews`}>
              {`★ ${experience.reputation.rating.toFixed(1)} · ${experience.reputation.reviewCount}`}
            </NexGText>
          </View>
        ) : null}

        {experience.attributes.length > 0 ? (
          <View style={[styles.section, styles.attrGrid]}>
            {experience.attributes.map((a) => (
              <View
                key={`${a.label}-${a.value}`}
                style={styles.attrCell}
                accessibilityLabel={`${a.label}: ${a.value}`}>
                <NexGText variant="caption" color="muted">
                  {a.label}
                </NexGText>
                <NexGText variant="body">{a.value}</NexGText>
              </View>
            ))}
          </View>
        ) : null}

        {experience.description ? (
          <View style={styles.section}>
            <NexGText variant="body">{experience.description}</NexGText>
          </View>
        ) : null}

        {experience.about ? (
          <View style={styles.section}>
            <NexGText variant="bodyStrong">{experience.about.title}</NexGText>
            <NexGText variant="body">{experience.about.body}</NexGText>
          </View>
        ) : null}

        {experience.sections.map((s) => renderSection(s))}
      </ScrollView>

      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.surface.primary,
            borderTopColor: colors.border.subtle,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}>
        <View style={styles.barLeft}>
          {experience.multiplier === 'fixed' ? (
            fixedDateLabel ? (
              <NexGText variant="caption" color="muted">
                {fixedDateLabel}
              </NexGText>
            ) : null
          ) : (
            <NexGQuantitySelector
              quantity={unitCount}
              onIncrement={() => stepUnit(1, activeMin, activeMax)}
              onDecrement={() => stepUnit(-1, activeMin, activeMax)}
            />
          )}
        </View>
        <View style={styles.barMiddle} accessibilityLabel={`Total ${formatKes(totalKes)}`}>
          <NexGPrice amountKes={totalKes} variant="bodyStrong" />
        </View>
        <NexGButton
          size="medium"
          label={ctaLabel}
          onPress={() => onAction(selection)}
          disabled={ctaDisabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  media: { marginBottom: 12 },
  section: { marginBottom: 16, gap: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4 },
  attrGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  attrCell: { width: '47%', gap: 2 },
  unitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  railContent: { gap: 8, paddingVertical: 4, paddingEnd: 24 },
  dateChip: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  sessionRow: { gap: 2, paddingVertical: 6 },
  relatedCard: { width: 160, padding: 12, gap: 4, borderWidth: 1 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
  },
  barLeft: { minWidth: 40 },
  barMiddle: { flex: 1 },
});
