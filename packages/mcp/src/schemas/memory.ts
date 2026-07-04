/**
 * Hand-written zod schemas for the six `memory.*` MCP verbs (D-2.20..73, D-26).
 *
 * These are the wire-facing shapes. They intentionally do NOT import from
 * `src/storage/rows.ts` — leaking row-level fields (tombstoned flag,
 * embedding provenance) onto the wire is exactly PITFALLS.md #7.
 *
 * Every input schema `.strict()` so unknown keys are rejected loudly, not
 * silently dropped. Every schema reuses `ScopeArgsSchema.shape` from
 * `common.ts` so `project_id` is defined in ONE place across the codebase.
 */
import { z } from "zod";
import { ScopeArgsSchema, ProvenanceEnvelopeSchema } from "./common.js";
import { MAX_TOKENS_DEFAULT,
MAX_TOKENS_MAX,
MAX_TOKENS_MIN, } from "@agent-memories/shared"

/* ────────────────────────── shared building blocks ────────────────────── */

/** Bounded content: 1..64_000 chars (D-2.20). */
const contentField = z.string().min(1).max(64_000);
/** Tag array: max 32 entries, each 1..64 chars (D-2.20). */
const tagsField = z.array(z.string().min(1).max(64)).max(32);

/* ─────────────────────────────  input schemas ─────────────────────────── */

/** memory.write args (D-2.20). */
export const MemoryWriteArgsSchema = z.object({
  content: contentField,
  tags: tagsField.optional(),
  source_agent: z.string().min(1),
  session_id: z.string().min(1).optional(),
  ...ScopeArgsSchema.shape,
}).strict();
export type MemoryWriteArgs = z.infer<typeof MemoryWriteArgsSchema>;

/** memory.search args (D-2.30). */
export const MemorySearchArgsSchema = z.object({
  query: z.string().min(1),
  max_tokens: z.number().int().min(MAX_TOKENS_MIN).max(MAX_TOKENS_MAX).default(MAX_TOKENS_DEFAULT),
  strict_scope: z.boolean().default(false),
  explain: z.boolean().default(false),
  include_health: z.boolean().default(false),
  ...ScopeArgsSchema.shape,
}).strict();
export type MemorySearchArgs = z.infer<typeof MemorySearchArgsSchema>;

/** memory.get args (D-2.40). */
export const MemoryGetArgsSchema = z.object({
  id: z.string().min(1),
  ...ScopeArgsSchema.shape,
}).strict();
export type MemoryGetArgs = z.infer<typeof MemoryGetArgsSchema>;

/** memory.update args (D-2.50/51). PATCH semantics: all business fields optional. */
export const MemoryUpdateArgsSchema = z.object({
  id: z.string().min(1),
  content: contentField.optional(),
  // `null` is explicit clear (D-2.50); `undefined` means leave untouched.
  tags: tagsField.nullable().optional(),
  if_updated_at: z.string().min(1).optional(),   // opt-in ETag (D-2.52)
  ...ScopeArgsSchema.shape,
}).strict();
export type MemoryUpdateArgs = z.infer<typeof MemoryUpdateArgsSchema>;

/** memory.delete args (D-2.60). */
export const MemoryDeleteArgsSchema = z.object({
  id: z.string().min(1),
  ...ScopeArgsSchema.shape,
}).strict();
export type MemoryDeleteArgs = z.infer<typeof MemoryDeleteArgsSchema>;

/** memory.list args (D-2.70). */
export const MemoryListArgsSchema = z.object({
  limit: z.number().int().min(1).max(500).default(50),
  cursor: z.string().min(1).optional(),
  strict_scope: z.boolean().default(false),
  include_tombstoned: z.boolean().default(false),
  ...ScopeArgsSchema.shape,
}).strict();
export type MemoryListArgs = z.infer<typeof MemoryListArgsSchema>;

/* ─────────────────────────  response schemas ──────────────────────────── */

/** Single search hit (D-2.10/11): NO raw content field. */
export const MemorySearchHitSchema = z.object({
  id: z.string().min(1),
  snippet: z.string(),
  score: z.number(),
  scope: z.object({
    user_id: z.string().min(1),
    project_id: z.string().min(1).nullable(),
  }).strict(),
  tags: z.array(z.string()).nullable(),
  updated_at: z.string().min(1),
  tombstoned: z.literal(false),
  explain: z.object({
    bm25_score: z.number().nullable(),
    vector_score: z.number().nullable(),
    fused_rank: z.number(),
  }).optional(),
}).strict();
export type MemorySearchHit = z.infer<typeof MemorySearchHitSchema>;

/** memory.search response envelope (D-2.34). */
export const MemorySearchResponseSchema = z.object({
  hits: z.array(MemorySearchHitSchema),
  truncated: z.boolean(),
  total_matched: z.number().int().min(0),
  health: z.object({
    pending_embed_count: z.number().int().min(0),
    failed_embed_count: z.number().int().min(0),
    embedder_health: z.enum(['healthy','unhealthy','disabled']),
  }).optional(),
}).strict();
export type MemorySearchResponse = z.infer<typeof MemorySearchResponseSchema>;

/** memory.delete response (D-2.62). */
export const MemoryDeleteResponseSchema = z.object({
  id: z.string().min(1),
  tombstoned: z.literal(true),
  updated_at: z.string().min(1),
}).strict();
export type MemoryDeleteResponse = z.infer<typeof MemoryDeleteResponseSchema>;

/**
 * Hand-written schema mirroring `MemoryDto` in shape (D-26 — never generate
 * schemas from row/dto types). Kept in schemas/memory.ts so the wire shape
 * is validated end-to-end without introducing a schema → dto module dep.
 */
export const MemoryDtoSchema = z.object({
  id: z.string().min(1),
  content: z.string(),
  tags: z.array(z.string()).nullable(),
  tombstoned: z.boolean(),
  ...ProvenanceEnvelopeSchema.shape,
}).strict();
export type MemoryDtoShape = z.infer<typeof MemoryDtoSchema>;

/** memory.list response (D-2.73). */
export const MemoryListResponseSchema = z.object({
  items: z.array(MemoryDtoSchema),
  next_cursor: z.string().nullable(),
}).strict();
export type MemoryListResponse = z.infer<typeof MemoryListResponseSchema>;
