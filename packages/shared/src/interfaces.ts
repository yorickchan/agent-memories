// Shared service type interfaces for cross-package use.
// The tool handlers call methods as: service.method(scope, args)

import type { ScopeContext } from "./scope.js";

// --- Memory Service ---

export interface MemoryService {
  write(scope: ScopeContext, args: { content: string; tags?: string[]; source_agent: string; session_id?: string }): Promise<unknown>;
  search(scope: ScopeContext, args: { query: string; max_tokens: number; strict_scope?: boolean; explain?: boolean; include_health?: boolean }): Promise<unknown>;
  get(scope: ScopeContext, id: string): Promise<unknown>;
  update(scope: ScopeContext, args: { id: string; content?: string; tags?: string[] | null; if_updated_at?: string }): Promise<unknown>;
  delete(scope: ScopeContext, id: string): Promise<unknown>;
  list(scope: ScopeContext, args: { limit?: number; cursor?: string; strict_scope?: boolean; include_tombstoned?: boolean }): Promise<unknown>;
}

// --- KG Service ---

export interface KgService {
  upsertNode(scope: ScopeContext, args: { type: string; name: string; props?: Record<string, unknown> | null; source_agent: string; session_id?: string }): Promise<unknown>;
  upsertEdge(scope: ScopeContext, args: { subject_id: string; predicate: string; object_id: string; props?: Record<string, unknown> | null; source_agent: string; session_id?: string }): Promise<unknown>;
  neighborhood(scope: ScopeContext, args: { node_id: string; depth?: number; limit?: number; max_tokens?: number }): Promise<unknown>;
  getNode(scope: ScopeContext, id: string): Promise<unknown>;
  graph(scope: ScopeContext, args: { format?: string; max_tokens?: number }): Promise<unknown>;
}

// --- WM Service ---

export interface WmService {
  get(scope: ScopeContext, session_id: string, key: string): Promise<unknown>;
  put(scope: ScopeContext, session_id: string, key: string, value: string, etag?: string, ttl_seconds?: number): Promise<unknown>;
  list(scope: ScopeContext, session_id: string): Promise<unknown>;
  delete(scope: ScopeContext, session_id: string, key: string): Promise<unknown>;
}
