// Stub embeddings NOW, real provider LATER via EMBEDDINGS_PROVIDER env.
// Contract stays stable: embed(text) -> number[1536] normalized.
// Swap: set EMBEDDINGS_PROVIDER=openai|ollama and implement fetch below; callers unchanged.
const DIM = 1536;

function stubEmbed(text: string): number[] {
  let h = 2166136261;
  const out = Array.from({ length: DIM }, () => 0);
  for (let i = 0; i < DIM; i++) {
    h ^= text.charCodeAt(i % Math.max(text.length, 1)) + i * 31;
    h = Math.imul(h, 16777619);
    out[i] = ((h >>> 8) % 2000) / 1000 - 1;
  }
  const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
  return out.map((v) => v / norm);
}

export async function embed(text: string): Promise<number[]> {
  const provider = process.env.EMBEDDINGS_PROVIDER ?? "stub";
  if (provider === "stub") return stubEmbed(text);
  // Later: openai text-embedding-3-small / local ollama nomic-embed
  throw new Error(`embeddings provider '${provider}' not configured yet`);
}

export function toVectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}
