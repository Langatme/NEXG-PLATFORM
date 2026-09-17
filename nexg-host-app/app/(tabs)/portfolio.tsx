import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGSwitch } from '@/components/ui/NexGSwitch';
import { NexGText } from '@/components/ui/NexGText';
import { GuestBanner } from '@/components/GuestBanner';
import {
  createProperty, createUnit, deleteUnit, getGuests, getProperty, getReservations, getUnits,
  updateProperty, updateUnit,
} from '@/lib/api';
import { useHostAuth } from '@/lib/store';
import { useTheme } from '@/theme';

export default function PortfolioScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const propertyId = useHostAuth((s) => s.propertyId);
  const isGuest = useHostAuth((s) => s.isGuest);
  const property = useQuery({ queryKey: ['h-property', propertyId], queryFn: getProperty, enabled: !!propertyId });
  const upcoming = useQuery({
    queryKey: ['h-upcoming', propertyId],
    queryFn: () => getReservations({ from: new Date().toISOString() }),
    enabled: !!propertyId,
  });
  // HST-007→015 property edit + HST-024→027 guests (derived, no manual CRM)
  const guests = useQuery({ queryKey: ['h-guests', propertyId], queryFn: getGuests, enabled: !!propertyId });
  // H-05: units live here (Portfolio tab — no new tabs).
  const units = useQuery({ queryKey: ['h-units', propertyId], queryFn: getUnits, enabled: !!propertyId });
  const [desc, setDesc] = useState('');
  const [heroKey, setHeroKey] = useState('');
  const [amenities, setAmenities] = useState('');
  const [policies, setPolicies] = useState('');
  const [newProp, setNewProp] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!propertyId) return <Redirect href="/(auth)/sign-in" />;

  const arrivals = (upcoming.data ?? []).filter((b) => b.status === 'CONFIRMED').length;
  const inHouse = (upcoming.data ?? []).filter((b) => b.status === 'CHECKED_IN').length;
  const refresh = () => {
    property.refetch(); upcoming.refetch(); guests.refetch(); units.refetch();
    queryClient.invalidateQueries({ queryKey: ['h-property'] });
  };
  const save = <T,>(fn: () => Promise<T>, done?: () => void) => {
    setBusy(true); setError(null);
    fn().then(() => { done?.(); refresh(); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Save failed'))
      .finally(() => setBusy(false));
  };
  const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={
        <RefreshControl
          refreshing={property.isRefetching || upcoming.isRefetching}
          onRefresh={refresh}
        />
      }
    >
      <GuestBanner />
      {property.isLoading ? (
        <NexGSectionSkeleton />
      ) : property.isError ? (
        <NexGErrorState onRetry={() => property.refetch()} />
      ) : (
        <View style={{ gap: spacing.sm }}>
          <NexGText variant="title">{property.data?.name ?? ''}</NexGText>
          <NexGText variant="caption" color="secondary">{property.data?.category_label ?? property.data?.kind ?? ''}</NexGText>
        </View>
      )}
      <View
        style={[styles.statsRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}
        accessibilityRole="summary"
        accessibilityLabel={`${arrivals} arrivals, ${inHouse} in house, from loaded reservations`}
      >
        <View style={styles.stat}>
          <NexGText variant="caption" color="secondary">Arrivals</NexGText>
          <NexGText variant="heading" style={styles.tabular}>{arrivals}</NexGText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <View style={styles.stat}>
          <NexGText variant="caption" color="secondary">In house</NexGText>
          <NexGText variant="heading" style={styles.tabular}>{inHouse}</NexGText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <View style={styles.stat}>
          <NexGText variant="caption" color="secondary">Units</NexGText>
          <NexGText variant="heading" style={styles.tabular}>{(units.data ?? []).length}</NexGText>
        </View>
      </View>
      <NexGCard>
        <NexGButton label="Analytics" variant="secondary" onPress={() => router.push('/analytics')} />
      </NexGCard>
      {/* HST-008 edit property (staff only; guests read) */}
      {!isGuest && (
      <NexGCard>
        <NexGSectionHeader title={`Property · ${property.data?.is_open === false ? 'Closed' : 'Open'}`} />
        <View style={{ gap: spacing.sm }}>
          <NexGSwitch
            label="Open for bookings"
            value={property.data?.is_open !== false}
            disabled={busy}
            onValueChange={(v) => save(() => updateProperty({ is_open: v }))}
          />
          <NexGInput label="Description" placeholder="Edit description" value={desc} onChangeText={setDesc} />
          <NexGInput label="Hero image key" placeholder="Hero image key (e.g. prop/hero.jpg)" value={heroKey} onChangeText={setHeroKey} autoCapitalize="none" />
          <NexGInput
            label="Amenities"
            placeholder={`Amenities (comma-separated)${property.data?.amenities?.length ? ` · now: ${property.data.amenities.join(', ')}` : ''}`}
            value={amenities}
            onChangeText={setAmenities}
          />
          <NexGInput
            label="Policies"
            placeholder={`Policies (comma-separated)${property.data?.policies?.length ? ` · now: ${property.data.policies.join(', ')}` : ''}`}
            value={policies}
            onChangeText={setPolicies}
          />
          <NexGButton
            label="Save details"
            loading={busy}
            onPress={() => {
              const patch: Parameters<typeof updateProperty>[0] = {};
              if (desc.trim()) patch.description = desc.trim();
              if (heroKey.trim()) patch.hero_image_key = heroKey.trim();
              if (amenities.trim()) patch.amenities = csv(amenities);
              if (policies.trim()) patch.policies = csv(policies);
              if (!Object.keys(patch).length) { setError('Nothing to save.'); return; }
              save(() => updateProperty(patch), () => { setDesc(''); setHeroKey(''); setAmenities(''); setPolicies(''); });
            }}
          />
          {error ? <NexGText variant="caption" color="error" accessibilityRole="alert">{error}</NexGText> : null}
        </View>
      </NexGCard>
      )}
      {/* HST-012→015 units (H-05; guests read, staff edit) */}
      <NexGCard>
        <NexGSectionHeader title={`Units · ${(units.data ?? []).length}`} />
        {units.isLoading ? (
          <NexGSectionSkeleton />
        ) : units.isError ? (
          <NexGErrorState onRetry={() => units.refetch()} />
        ) : !(units.data ?? []).length ? (
          <NexGEmptyState emoji="🏠" title="No units yet" message="Add your first unit below to open bookings." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {(units.data ?? []).map((u) => (
              <View key={u.id} style={[styles.unitRow, { borderColor: colors.border.subtle }]}>
                <View style={styles.row}>
                  <NexGText variant="body" style={[styles.tabular, { flex: 1 }]}>{u.name} · {u.unit_type} · {u.capacity} guests{u.price_kes ? ` · KES ${u.price_kes}` : ''}</NexGText>
                  {!isGuest && (
                  <NexGSwitch
                    label={`Active ${u.name}`}
                    value={u.is_active}
                    disabled={busy}
                    onValueChange={(v) => save(() => updateUnit(u.id, { is_active: v }))}
                  />
                  )}
                </View>
                {!isGuest && (editingUnit === u.id ? (
                  <View style={{ gap: spacing.sm }}>
                    <NexGInput label="Unit name" placeholder="Unit name" value={editName} onChangeText={setEditName} />
                    <View style={styles.row}>
                      <NexGButton label="Rename" loading={busy} onPress={() => {
                        if (!editName.trim()) { setError('Name required.'); return; }
                        save(() => updateUnit(u.id, { name: editName.trim() }), () => { setEditingUnit(null); setEditName(''); });
                      }} />
                      <NexGButton label="Delete" variant="secondary" loading={busy} onPress={() => {
                        save(() => deleteUnit(u.id).catch((e) => {
                          const msg = e instanceof Error ? e.message : '';
                          if (msg.includes('409')) throw new Error('Unit has bookings — cannot delete.');
                          throw e;
                        }), () => setEditingUnit(null));
                      }} />
                    </View>
                  </View>
                ) : (
                  <NexGButton label="Edit" variant="secondary" onPress={() => { setEditingUnit(u.id); setEditName(u.name); setError(null); }} />
                ))}
              </View>
            ))}
          </View>
        )}
        {!isGuest && (
        <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
          <NexGInput label="New unit name" placeholder="New unit name (e.g. Suite 101)" value={unitName} onChangeText={setUnitName} />
          <NexGInput label="Nightly price KES" placeholder="Nightly price KES (optional)" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />
          <NexGButton
            label="Add unit"
            variant="secondary"
            loading={busy}
            onPress={() => {
              if (!unitName.trim()) { setError('Unit name required.'); return; }
              const price = unitPrice.trim() ? Number(unitPrice.trim()) : undefined;
              if (unitPrice.trim() && !Number.isFinite(price)) { setError('Price must be a number.'); return; }
              save(() => createUnit({ name: unitName.trim(), price_kes: price }), () => { setUnitName(''); setUnitPrice(''); });
            }}
          />
        </View>
        )}
      </NexGCard>
      {/* HST-007 create property (staff only) */}
      {!isGuest && (
      <NexGCard>
        <NexGSectionHeader title="New property" />
        <View style={{ gap: spacing.sm }}>
          <NexGInput label="Property name" placeholder="Property name" value={newProp} onChangeText={setNewProp} />
          <NexGButton
            label="Create property"
            variant="secondary"
            loading={busy}
            onPress={() => {
              if (!newProp.trim()) { setError('Name required.'); return; }
              save(() => createProperty({ name: newProp.trim() }), () => setNewProp(''));
            }}
          />
        </View>
      </NexGCard>
      )}
      {/* HST-024→027 guests derived from stays */}
      <NexGCard>
        <NexGSectionHeader title={`Guests · ${(guests.data ?? []).length}`} />
        {!(guests.data ?? []).length ? (
          <NexGEmptyState emoji="🧳" title="No guests yet" message="Guests appear here after their first stay." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {(guests.data ?? []).slice(0, 20).map((g) => (
              <TouchableOpacity
                key={g.account_id}
                style={[styles.row, { minHeight: 44 }]}
                onPress={() => router.push({ pathname: '/guest/[id]', params: { id: g.account_id } })}
                accessibilityRole="button"
                accessibilityLabel={`Guest ${g.account_id.slice(0, 8)}, ${g.stays} stays`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <NexGText variant="body">Guest {g.account_id.slice(0, 8)}</NexGText>
                <NexGText variant="caption" style={styles.tabular}>{g.stays} stays · KES {g.total_kes}</NexGText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </NexGCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  statsRow: { flexDirection: 'row', borderWidth: 1, padding: 16, gap: 8 },
  stat: { flex: 1, alignItems: 'center', gap: 4, minHeight: 44, justifyContent: 'center' },
  divider: { width: 1, alignSelf: 'stretch' },
  unitRow: { gap: 8, paddingVertical: 8, borderBottomWidth: 1 },
  tabular: { fontVariant: ['tabular-nums'] },
});
