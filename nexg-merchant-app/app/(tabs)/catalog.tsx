import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGMedia } from '@/components/ui/NexGMedia';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSearchBar } from '@/components/ui/NexGSearchBar';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGSwitch } from '@/components/ui/NexGSwitch';
import { NexGText } from '@/components/ui/NexGText';
import type { AddonGroup, MerchantCatalogItem, ServiceRequest } from '@/lib/api';
import {
  ApiError,
  attachMedia,
  createCatalogItem,
  createSection,
  createService,
  createVariant,
  deleteAddon,
  deleteCatalogItem,
  deleteSection,
  deleteVariant,
  getCatalog,
  getCatalogItemDetail,
  getMedia,
  getRequests,
  publishCatalog,
  readErrorBody,
  readStringField,
  updateCatalogItem,
  updateSection,
  upsertAddons,
} from '@/lib/api';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';
import { mediaFromKey } from '@/utils/images';

function friendlyError(cause: unknown): string {
  if (cause instanceof ApiError) {
    const record = readErrorBody(cause.body);
    if (record === null) return `Request failed (${cause.status}).`;
    const code = readStringField(record, 'error');
    if (code === null) return `Request failed (${cause.status}).`;
    if (code === 'section_has_items') return 'Move items out first, then delete the section.';
    if (code === 'referenced_by_history') return 'Kept for history — set Unavailable instead of deleting.';
    if (code === 'stale_price') return 'Price changed — refresh and retry.';
    const hint = readStringField(record, 'hint');
    return hint === null ? code : `${code} — ${hint}`;
  }
  return cause instanceof Error ? cause.message : 'Save failed';
}

export default function CatalogScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const merchantId = useMerchantAuth((s) => s.merchantId);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishInfo, setPublishInfo] = useState<string | null>(null);
  // MRC-034→048 sections + MRC-043→044 variants/addons
  const [newSection, setNewSection] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [variants, setVariants] = useState<Record<string, Array<{ id: string; name: string; price_delta_kes: number }>>>({});
  const [newVariant, setNewVariant] = useState<Record<string, string>>({});
  // M-10: addon-group editor (MRC-044) + media attach (MRC-042) + services (MRC-049→056)
  const [addons, setAddons] = useState<Record<string, AddonGroup[]>>({});
  const [addonName, setAddonName] = useState<Record<string, string>>({});
  const [addonOptions, setAddonOptions] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<Record<string, Array<{ id: string; url: string }>>>({});
  const [mediaUrl, setMediaUrl] = useState<Record<string, string>>({});
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [newService, setNewService] = useState('');
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['m-catalog', merchantId], queryFn: getCatalog, enabled: !!merchantId });

  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;
  if (query.isLoading) return <NexGSectionSkeleton />;
  if (query.isError) return <NexGErrorState onRetry={() => query.refetch()} />;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['m-catalog', merchantId] });
  const items = (query.data?.items ?? []).filter((i) =>
    q.trim() ? i.name.toLowerCase().includes(q.trim().toLowerCase()) : true
  );
  const sections = query.data?.sections ?? [];

  const savePrice = (item: MerchantCatalogItem) => {
    const v = Math.round(Number(price));
    if (!Number.isFinite(v) || v < 0) {
      setError('Enter a valid price in KES.');
      return;
    }
    setBusy(true);
    setError(null);
    updateCatalogItem(item.id, { price_kes: v })
      .then(() => {
        setEditing(null);
        refresh();
      })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const toggleAvailable = (item: MerchantCatalogItem) => {
    setBusy(true);
    updateCatalogItem(item.id, { is_available: !(item.isAvailable ?? true) })
      .then(refresh)
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const addItem = () => {
    const v = Math.round(Number(newPrice));
    if (!newName.trim() || !Number.isFinite(v) || v < 0) {
      setError('Name and valid KES price required.');
      return;
    }
    setBusy(true);
    setError(null);
    createCatalogItem({ section_id: sections[0]?.id, name: newName.trim(), price_kes: v })
      .then(() => {
        setAdding(false);
        setNewName('');
        setNewPrice('');
        refresh();
      })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const addSection = () => {
    if (!newSection.trim()) { setError('Section name required.'); return; }
    setBusy(true); setError(null);
    createSection(newSection.trim())
      .then(() => { setNewSection(''); refresh(); })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const saveSection = (id: string) => {
    if (!renameValue.trim()) { setError('Name required.'); return; }
    setBusy(true);
    updateSection(id, { name: renameValue.trim() })
      .then(() => { setRenaming(null); refresh(); })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const removeSection = (id: string) => {
    setBusy(true);
    deleteSection(id)
      .then(refresh)
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const loadVariants = (itemId: string) => {
    if (!variants[itemId]) {
      getCatalogItemDetail(itemId)
        .then((d) => {
          setVariants((v) => ({ ...v, [itemId]: d.variants ?? [] }));
          setAddons((a) => ({ ...a, [itemId]: d.addon_groups ?? [] }));
        })
        .catch(() => undefined);
    }
    if (!media[itemId]) {
      getMedia('item', itemId).then((m) => setMedia((prev) => ({ ...prev, [itemId]: m }))).catch(() => undefined);
    }
  };

  const addVariant = (itemId: string) => {
    const name = (newVariant[itemId] ?? '').trim();
    if (!name) { setError('Variant name required.'); return; }
    setBusy(true);
    createVariant(itemId, { name })
      .then((v) => {
        setVariants((prev) => ({ ...prev, [itemId]: [...(prev[itemId] ?? []), { id: v.id, name, price_delta_kes: 0 }] }));
        setNewVariant((prev) => ({ ...prev, [itemId]: '' }));
      })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const saveAddons = (itemId: string) => {
    const name = (addonName[itemId] ?? 'Add-ons').trim() || 'Add-ons';
    const options = (addonOptions[itemId] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ label, price_delta_kes: 0 }));
    setBusy(true); setError(null);
    upsertAddons(itemId, { name, required: false, multi: true, options })
      .then(() => getCatalogItemDetail(itemId))
      .then((d) => setAddons((a) => ({ ...a, [itemId]: d.addon_groups ?? [] })))
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const attachItemMedia = (itemId: string) => {
    const url = (mediaUrl[itemId] ?? '').trim();
    if (!url) { setError('Paste an image URL or uploaded key first.'); return; }
    setBusy(true); setError(null);
    attachMedia({ entity_type: 'item', entity_id: itemId, url })
      .then(() => getMedia('item', itemId))
      .then((m) => {
        setMedia((prev) => ({ ...prev, [itemId]: m }));
        setMediaUrl((prev) => ({ ...prev, [itemId]: '' }));
      })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const doPublish = () => {
    setBusy(true); setError(null); setPublishInfo(null);
    publishCatalog()
      .then((r) => setPublishInfo(`Live: ${r.live_items}/${r.total_items} items · ${r.sections} sections`))
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  const loadServices = () => {
    getRequests({ kind: 'service' })
      .then((rows) => setServices(rows))
      .catch(() => undefined);
  };

  const addService = () => {
    if (!newService.trim()) { setError('Service title required.'); return; }
    setBusy(true); setError(null);
    createService({ title: newService.trim() })
      .then(() => { setNewService(''); loadServices(); })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setBusy(false));
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
    >
      <View style={styles.row}>
        <NexGText variant="title" style={{ fontVariant: ['tabular-nums'] }}>Catalog · {items.length}</NexGText>
        <View style={[styles.row, { gap: spacing.sm }]}>
          <NexGButton label={adding ? 'Close' : '+ Add'} variant="secondary" size="medium" onPress={() => setAdding(!adding)} />
          <NexGButton label="Publish" size="medium" loading={busy} onPress={doPublish} />
        </View>
      </View>
      {publishInfo ? <NexGText variant="caption" color="muted">{publishInfo}</NexGText> : null}
      {adding ? (
        <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle }]}>
          <NexGInput label="Item name" placeholder="Item name" value={newName} onChangeText={setNewName} />
          <NexGInput label="Price KES" placeholder="Price KES" value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" />
          {error ? <NexGText variant="caption" color="error" accessibilityRole="alert">{error}</NexGText> : null}
          <NexGButton label="Create item" loading={busy} onPress={addItem} />
        </View>
      ) : null}
      <NexGSearchBar value={q} onChangeText={setQ} placeholder="Search items…" accessibilityLabel="Search items" />
      {error && !adding ? <NexGText variant="caption" color="error" accessibilityRole="alert">{error}</NexGText> : null}
      {/* MRC-034→037 sections */}
      <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle }]}>
        <NexGSectionHeader title={`Sections · ${sections.length}`} />
        <View style={styles.row}>
          <NexGInput label="New section" placeholder="New section" value={newSection} onChangeText={setNewSection} containerStyle={{ flex: 1 }} />
          <NexGButton label="Add" size="medium" loading={busy} onPress={addSection} />
        </View>
        {sections.map((s) => (
          <View key={s.id} style={styles.row}>
            {renaming === s.id ? (
              <>
                <NexGInput label="Section name" placeholder="Section name" value={renameValue} onChangeText={setRenameValue} containerStyle={{ flex: 1 }} />
                <NexGButton label="Save" size="medium" loading={busy} onPress={() => saveSection(s.id)} />
              </>
            ) : (
              <>
                <NexGText variant="bodyStrong">{s.title}</NexGText>
                <View style={[styles.row, { gap: spacing.sm }]}>
                  <NexGButton label="Rename" variant="secondary" size="medium" onPress={() => { setRenaming(s.id); setRenameValue(s.title); }} />
                  <NexGButton label="Delete" variant="ghost" size="medium" onPress={() => removeSection(s.id)} />
                </View>
              </>
            )}
          </View>
        ))}
      </View>
      {/* MRC-049→056 services (requests kind=service) */}
      <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle }]}>
        <NexGSectionHeader title={`Services · ${services.length}`} actionLabel="Load" onAction={loadServices} />
        <View style={styles.row}>
          <NexGInput label="New service" placeholder="New service" value={newService} onChangeText={setNewService} containerStyle={{ flex: 1 }} />
          <NexGButton label="Add" size="medium" loading={busy} onPress={addService} />
        </View>
        {services.slice(0, 10).map((s) => (
          <View key={s.id} style={styles.row}>
            <NexGText variant="body">{s.title}</NexGText>
            <NexGBadge label={s.status} tone="neutral" />
          </View>
        ))}
      </View>
      {!items.length ? (
        <NexGEmptyState emoji="📦" title="No items" message="Add your first item above." />
      ) : (
        sections.map((s) => {
          const rows = items.filter((i) => i.sectionId === s.id);
          if (!rows.length) return null;
          return (
            <View key={s.id} style={{ gap: spacing.sm }}>
              <NexGSectionHeader title={s.subtitle ? `${s.title} · ${s.subtitle}` : s.title} />
              {rows.map((i) => {
                const previewRef = i.imageKey ?? media[i.id]?.[0]?.url ?? null;
                const isOpen = editing === i.id;
                return (
                  <View
                    key={i.id}
                    style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, opacity: i.isAvailable === false ? 0.55 : 1 }]}
                  >
                    <View style={[styles.row, { gap: spacing.sm }]}>
                      <NexGMedia
                        media={mediaFromKey(previewRef, { emoji: '📦', alt: i.name })}
                        style={{ width: 56, height: 56, borderRadius: radii.medium }}
                        emojiSize={24}
                        showUnavailableCaption={false}
                      />
                      <TouchableOpacity
                        onPress={() => { setEditing(isOpen ? null : i.id); setPrice(String(i.priceKes)); loadVariants(i.id); }}
                        accessibilityRole="button"
                        accessibilityLabel={`${i.name}, KES ${i.priceKes}`}
                        accessibilityState={{ expanded: isOpen }}
                        accessibilityHint="Expands the item editor"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ flex: 1, gap: 4, minHeight: 44, justifyContent: 'center' }}
                      >
                        <View style={styles.row}>
                          <NexGText variant="bodyStrong" numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1 }}>{i.name}</NexGText>
                          {i.isPopular ? <NexGBadge label="Popular" tone="accent" /> : null}
                        </View>
                        <View style={styles.row}>
                          <NexGText variant="caption" color="muted" numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1 }}>
                            {i.description ? i.description.slice(0, 60) : 'No description'}
                          </NexGText>
                          <NexGPrice amountKes={i.priceKes} />
                        </View>
                      </TouchableOpacity>
                      <Ionicons
                        name={isOpen ? 'chevron-down' : 'chevron-forward'}
                        size={20}
                        color={colors.text.muted}
                      />
                    </View>
                    <NexGSwitch
                      label={`Available · ${i.name}`}
                      value={i.isAvailable ?? true}
                      onValueChange={() => toggleAvailable(i)}
                      disabled={busy}
                    />
                    {isOpen ? (
                      <View style={{ gap: 8 }}>
                        <View style={styles.row}>
                          <NexGInput label="Price KES" placeholder="Price KES" value={price} onChangeText={setPrice} keyboardType="numeric" containerStyle={{ flex: 1 }} />
                          <NexGButton label="Save" size="medium" loading={busy} onPress={() => savePrice(i)} />
                        </View>
                        {/* MRC-043 variants */}
                        <NexGSectionHeader title={`Variants · ${(variants[i.id] ?? []).length}`} />
                        {(variants[i.id] ?? []).map((v) => (
                          <View key={v.id} style={styles.row}>
                            <NexGText variant="body" style={{ fontVariant: ['tabular-nums'] }}>{v.name} (+{v.price_delta_kes})</NexGText>
                            <NexGButton
                              label="Delete"
                              variant="ghost"
                              size="medium"
                              onPress={() => {
                                setBusy(true);
                                deleteVariant(v.id).then(() => {
                                  setVariants((prev) => ({ ...prev, [i.id]: (prev[i.id] ?? []).filter((x) => x.id !== v.id) }));
                                }).finally(() => setBusy(false));
                              }}
                            />
                          </View>
                        ))}
                        <View style={styles.row}>
                          <NexGInput
                            label="New variant"
                            placeholder="New variant"
                            value={newVariant[i.id] ?? ''}
                            onChangeText={(t) => setNewVariant((p) => ({ ...p, [i.id]: t }))}
                            containerStyle={{ flex: 1 }}
                          />
                          <NexGButton label="+ Variant" variant="secondary" size="medium" onPress={() => addVariant(i.id)} />
                        </View>
                        {/* MRC-044 modifier groups */}
                        <NexGSectionHeader title={`Add-ons · ${(addons[i.id] ?? []).length}`} />
                        {(addons[i.id] ?? []).map((g) => (
                          <View key={g.id} style={styles.row}>
                            <NexGText variant="body">{g.name} ({(g.options ?? []).length})</NexGText>
                            <NexGButton
                              label="Delete"
                              variant="ghost"
                              size="medium"
                              onPress={() => {
                                setBusy(true);
                                deleteAddon(g.id).then(() => {
                                  setAddons((prev) => ({ ...prev, [i.id]: (prev[i.id] ?? []).filter((x) => x.id !== g.id) }));
                                }).finally(() => setBusy(false));
                              }}
                            />
                          </View>
                        ))}
                        <NexGInput
                          label="Addon group"
                          placeholder="Addon group name"
                          value={addonName[i.id] ?? ''}
                          onChangeText={(t) => setAddonName((p) => ({ ...p, [i.id]: t }))}
                        />
                        <NexGInput
                          label="Options"
                          placeholder="Options (comma separated)"
                          value={addonOptions[i.id] ?? ''}
                          onChangeText={(t) => setAddonOptions((p) => ({ ...p, [i.id]: t }))}
                        />
                        <NexGButton label="Save add-ons" variant="secondary" loading={busy} onPress={() => saveAddons(i.id)} />
                        {/* MRC-042 media */}
                        <NexGSectionHeader title={`Media · ${(media[i.id] ?? []).length}`} />
                        {previewRef ? (
                          <View style={[styles.row, { gap: spacing.sm, justifyContent: 'flex-start' }]}>
                            <NexGMedia
                              media={mediaFromKey(previewRef, { emoji: '📦', alt: i.name })}
                              style={{ width: 96, height: 96, borderRadius: radii.medium }}
                              emojiSize={32}
                              showUnavailableCaption
                            />
                            <NexGText variant="caption" color="muted" style={{ flex: 1 }}>
                              Live preview from attached media. Change it with the URL field below.
                            </NexGText>
                          </View>
                        ) : (
                          <NexGText variant="caption" color="muted">No image yet — paste a URL below to attach one.</NexGText>
                        )}
                        {(media[i.id] ?? []).slice(0, 3).map((m) => (
                          <NexGText key={m.id} variant="caption" color="muted" numberOfLines={1} ellipsizeMode="tail">{m.url.slice(0, 72)}</NexGText>
                        ))}
                        <View style={styles.row}>
                          <NexGInput
                            label="Image URL"
                            placeholder="Image URL or key"
                            value={mediaUrl[i.id] ?? ''}
                            onChangeText={(t) => setMediaUrl((p) => ({ ...p, [i.id]: t }))}
                            containerStyle={{ flex: 1 }}
                          />
                          <NexGButton label="Attach" variant="secondary" size="medium" onPress={() => attachItemMedia(i.id)} />
                        </View>
                        <NexGButton
                          label="Delete item"
                          variant="ghost"
                          size="medium"
                          onPress={() => {
                            setBusy(true);
                            deleteCatalogItem(i.id).then(refresh).catch((e) => setError(friendlyError(e))).finally(() => setBusy(false));
                          }}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
});
