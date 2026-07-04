/**
 * Hand-written zod schemas for the four `kg.*` MCP verbs (D-4.07/4.09, D-26).
 *
 * D-26: these schemas are HAND-WRITTEN, never generated from
 * `src/storage/rows.ts`. Generating from row types would silently leak
 * internal storage columns (embedding provenance, tombstone flags, ...)
 * into the wire protocol whenever a new column was added.
 *
 * The shapes here intentionally mirror the SQL schema, but the import is
 * forbidden on purpose: a storage-layer change MUST touch both the row
 * type AND this schema to surface on the wire.
 */
import { z } from "zod";
import { ScopeArgsSchema } from "./common.js";
import { MAX_TOKENS_DEFAULT,
MAX_TOKENS_MAX,
MAX_TOKENS_MIN, } from "@agent-memories/shared"

/* ─────────────────────────────  input schemas ──────────────────────────── */

/** kg.upsert_node args (KG-01, D-4.01). */
export const KgUpsertNodeArgsSchema = z.object({
  type: z.string().min(1).max(128),
  name: z.string().min(1).max(512),
  props: z.record(z.string(), z.unknown()).nullable().optional(),
  ...ScopeArgsSchema.shape,
}).strict();
export type KgUpsertNodeArgs = z.infer<typeof KgUpsertNodeArgsSchema>;

/** kg.upsert_edge args (KG-02, D-4.02). */
export const KgUpsertEdgeArgsSchema = z.object({
  subject_id: z.string().min(1),
  predicate: z.string().min(1).max(512).trim(),
  object_id: z.string().min(1),
  props: z.record(z.string(), z.unknown()).nullable().optional(),
  ...ScopeArgsSchema.shape,
}).strict();
export type KgUpsertEdgeArgs = z.infer<typeof KgUpsertEdgeArgsSchema>;

/** kg.neighborhood args (KG-03, D-4.03). */
export const KgNeighborhoodArgsSchema = z.object({
  node_id: z.string().min(1),
  depth: z.number().int().min(0).max(2).default(1),
  max_tokens: z.number().int().min(MAX_TOKENS_MIN).max(MAX_TOKENS_MAX).default(MAX_TOKENS_DEFAULT),
  strict_scope: z.boolean().default(false),
  ...ScopeArgsSchema.shape,
}).strict();
export type KgNeighborhoodArgs = z.infer<typeof KgNeighborhoodArgsSchema>;

/** kg.get_node args (KG-04, D-4.08d). */
export const KgGetNodeArgsSchema = z.object({
  id: z.string().min(1),
  ...ScopeArgsSchema.shape,
}).strict();
export type KgGetNodeArgs = z.infer<typeof KgGetNodeArgsSchema>;

/* ─────────────────────────  response schemas ───────────────────────────── */

/** Single edge in a neighborhood response (D-4.03b). */
export const KgNeighborhoodEdgeSchema = z.object({
  predicate: z.string(),
  direction: z.literal("out"),
  node: z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    props: z.unknown().nullable(),
    user_id: z.string(),
    project_id: z.string().nullable(),
    source_agent: z.string(),
    session_id: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    embedding_model: z.null(),
    embedding_version: z.null(),
  }).strict(),
  props: z.unknown().nullable(),
}).strict();
export type KgNeighborhoodEdge = z.infer<typeof KgNeighborhoodEdgeSchema>;

/** Neighborhood metadata block (D-4.03b). */
export const KgNeighborhoodMetaSchema = z.object({
  depth: z.number().int().min(0).max(2),
  truncated: z.boolean(),
  total_edges_discovered: z.number().int().min(0),
}).strict();
export type KgNeighborhoodMeta = z.infer<typeof KgNeighborhoodMetaSchema>;

/** kg.neighborhood response envelope (D-4.03b). */
export const KgNeighborhoodResponseSchema = z.object({
  node: z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    props: z.unknown().nullable(),
    user_id: z.string(),
    project_id: z.string().nullable(),
    source_agent: z.string(),
    session_id: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    embedding_model: z.null(),
    embedding_version: z.null(),
  }).strict(),
  edges: z.array(KgNeighborhoodEdgeSchema),
  meta: KgNeighborhoodMetaSchema,
}).strict();
export type KgNeighborhoodResponse = z.infer<typeof KgNeighborhoodResponseSchema>;

/** kg.graph args — return full project graph (v2.0). */
export const KgGraphArgsSchema = ScopeArgsSchema.extend({
  format: z.enum(["mermaid", "json"]).optional().default("mermaid"),
}).strict();
export type KgGraphArgs = z.infer<typeof KgGraphArgsSchema>;
