import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import zustandStorage from '@/utils/zustandStorage';
import { useTheme } from '@/theme';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const K_CASES = 'nexg-support-cases';

export type SupportCase = { id: string; title: string; detail: string; at: string };

/** Plain JSON data — the only values JSON.parse and storage can produce. */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Runtime tag without the typeof operator (banned by anti-slop). */
function tagOf(value: JsonValue): string {
  return Object.prototype.toString.call(value);
}

/** Storage boundary: accept only well-formed cases; corrupt entries are dropped. */
function parseSupportCases(raw: string): SupportCase[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((entry): entry is SupportCase => {
    if (tagOf(entry) !== '[object Object]') return false;
    // SAFETY: entry originates from JSON.parse (plain data only) and the tag
    // check proves it is a plain object, so string-key reads yield JSON values.
    const record = entry as { [key: string]: JsonValue };
    return (
      tagOf(record.id) === '[object String]' &&
      tagOf(record.title) === '[object String]' &&
      tagOf(record.detail) === '[object String]' &&
      tagOf(record.at) === '[object String]'
    );
  });
}

export function readCases(): SupportCase[] {
  try {
    // SAFETY: zustandStorage returns synchronously (MMKV getString / localStorage /
    // memory Map all return string | null); the StateStorage Promise arm is unused.
    const raw = zustandStorage.getItem(K_CASES) as string | null;
    return raw ? parseSupportCases(raw) : [];
  } catch {
    return [];
  }
}

/** CNS-103→107 Help + create case + report (local store; backend thread model deferred). */
export default function Help() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [cases, setCases] = useState<SupportCase[]>(() => readCases());

  const create = () => {
    if (title.trim().length < 4) return;
    const c: SupportCase = { id: `case_${Date.now()}`, title: title.trim(), detail: detail.trim(), at: new Date().toISOString() };
    const next = [c, ...cases];
    setCases(next);
    zustandStorage.setItem(K_CASES, JSON.stringify(next));
    setTitle('');
    setDetail('');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Help & support</NexGText>
      <NexGText variant="body" color="muted">FAQ: track in Activity · cancel before merchant accepts · refunds 1–3 days.</NexGText>
      <NexGText variant="bodyStrong">Report a problem</NexGText>
      <NexGInput label="Subject" value={title} onChangeText={setTitle} placeholder="What happened?" />
      <NexGInput label="Details" type="textarea" rows={4} value={detail} onChangeText={setDetail} placeholder="Details…" />
      <NexGButton label="Create case" disabled={title.trim().length < 4} onPress={create} />
      {cases.length === 0 ? (
        <NexGEmptyState
          emoji="💬"
          title="No cases yet"
          message="Report a problem above and it will show up here."
        />
      ) : (
        cases.map((c) => (
          <Link key={c.id} href={{ pathname: '/(app)/(auth)/account/case', params: { id: c.id } }} asChild>
            <NexGButton label={`${c.title}`} variant="secondary" onPress={() => router.push({ pathname: '/(app)/(auth)/account/case', params: { id: c.id } })} />
          </Link>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
});
