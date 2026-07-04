# Memory Verbs

6 verbs for long-lived fact and summary storage with server-enforced `max_tokens` budget, hybrid BM25+vector ranking via Reciprocal Rank Fusion, and scope inheritance.

## memory.write

Write a long-lived memory fact or summary. Returns full provenance envelope.

```json
{
  "content": "Docker container failed to start due to port conflict on 8080",
  "source_agent": "claude-code",
  "session_id": "session-abc",
  "tags": ["docker", "debugging"]
}
```

Response: `MemoryDto` with ULID id, tags parsed as string array, tombstoned flag.

## memory.search

Search memories with a server-enforced `max_tokens` budget. Returns snippets+ids — never full content. Use `memory.get(id)` for the full body.

```json
{
  "query": "why did the service refuse to boot",
  "max_tokens": 1000
}
```

Optional:
- `explain: true` — per-hit `{bm25_score, vector_score, fused_rank}` trace (Phase 3)
- `include_health: true` — embedder status + pending/failed counts
- `strict_scope: true` — disable scope inheritance (only project rows)

Scope inheritance: project-scoped queries surface user-scoped rows ranked below project rows.

Response: `{hits: MemorySearchHit[], truncated: boolean, total_matched: number}`
Each hit: `{id, snippet, score, scope: {user_id, project_id}, tags, updated_at}`

## memory.get

Retrieve a full memory by id. Scope-filtered. Tombstoned rows MAY be returned (for undo workflows).

```json
{"id": "01JABC..."}
```

Not found within scope → `-32602 "Memory not found in scope"`.

## memory.update

PATCH a memory by id. Only send fields you want to change. Optional optimistic concurrency via `if_updated_at` ETag.

```json
{
  "id": "01JABC...",
  "content": "Updated description of the Docker issue",
  "if_updated_at": "2026-07-01T12:00:00.000Z"
}
```

Tags: set to `null` to clear, omit to keep. ETag mismatch → `-32000 "Precondition failed"`.
FTS5 index reindexed automatically on content change (Phase 2).

## memory.delete

Soft-delete a memory by id. Row retained in DB (tombstone flag), absent from search+list.

```json
{"id": "01JABC..."}
```

Response: `{id, tombstoned: true, updated_at}`.

## memory.list

Cursor-paginated list of all non-tombstoned memories in a scope. Newest first.

```json
{"limit": 50}
```

Optional: `cursor` (from previous response), `include_tombstoned: true`, `strict_scope: true`.

Response: `{items: MemoryDto[], next_cursor: string | null}`.
Cursor is an opaque base64url token — pass it as-is on the next call.

### Write-time dedup (Phase 6)

When enabled (`memory.dedup_enabled: true`, default), `memory.write` checks for near-duplicate content (cosine similarity ≥ `memory.dedup_threshold`, default 0.92). If a near-duplicate is found, returns the existing row instead of creating a new one. Fail-open: if the embedder is down, writes still succeed.