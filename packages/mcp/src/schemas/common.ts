/**
 * Hand-written zod schemas for MCP tool input + shared response shapes.
 *
 * D-26: these schemas are HAND-WRITTEN, never generated from `src/storage/rows.ts`.
 * Generating from row types would silently leak internal storage columns
 * (embedding provenance, tombstone flags, ...) into the wire protocol
 * whenever a new column was added — exactly PITFALLS.md #7.
 *
 * The shapes here intentionally mirror the SQL schema, but the import is
 * forbidden on purpose: a storage-layer change MUST touch both the row
 * type AND this schema to surface on the wire.
 */
import { z } from "zod";

/**
 * Scope argument accepted on every tool call (D-02).
 *
 * `user_id` is server-fixed (D-01) and never comes from the caller, so the
 * only scope knob agents pass is an optional `project_id`. Omitting it
 * scopes the row to the user only (project_id IS NULL).
 */
export const ScopeArgsSchema = z.object({
  project_id: z.string().min(1).optional(),
}).strict();
export type ScopeArgs = z.infer<typeof ScopeArgsSchema>;

/**
 * Provenance envelope every DTO must expose (MEM-08, KG-05).
 *
 * `user_id` is always present (server-fixed, never null). The remaining
 * fields carry the agent/session that produced the row plus embedding
 * provenance so a reader can tell HOW a memory was vectorized.
 */
export const ProvenanceEnvelopeSchema = z.object({
  user_id:           z.string().min(1),
  project_id:        z.string().min(1).nullable(),
  source_agent:      z.string().min(1),
  session_id:        z.string().min(1).nullable(),
  created_at:        z.string().min(1),
  updated_at:        z.string().min(1),
  embedding_model:   z.string().nullable(),
  embedding_version: z.string().nullable(),
}).strict();
export type ProvenanceEnvelope = z.infer<typeof ProvenanceEnvelopeSchema>;