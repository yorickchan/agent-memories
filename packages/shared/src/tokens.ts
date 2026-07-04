// Token constants extracted to shared package.
// Source: src/services/token/count.ts

export function countTokens(text: string): number {
  return Math.ceil(new TextEncoder().encode(text).length / 4);
}

export const MEMORY_HIT_ENVELOPE_TOKENS = 20 as const;
export const MAX_TOKENS_MIN = 100 as const;
export const MAX_TOKENS_MAX = 32_000 as const;
export const MAX_TOKENS_DEFAULT = 1_000 as const;
