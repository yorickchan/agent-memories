# Working Memory Verbs

4 verbs for a per-session key/value scratchpad agents can share. Optimistic concurrency via mandatory ETag (`if_match`), server-enforced token budget (10k per scope, default), FIFO eviction when budget exceeded, and TTL-based expiry (cleanup on read, no background daemon).

## wm.put

Write a value to the working memory scratchpad. **`if_match` (ETag) is mandatory** — missing or stale causes `-32000 Precondition failed`.

```json
{
  "session_id": "research-session-001",
  "key": "current-topic",
  "value": "investigating Docker port conflict",
  "if_match": "01JETAG..."
}
```

Optional: `ttl_seconds` — auto-expire the entry after N seconds. Example: `"ttl_seconds": 3600` for one-hour auto-expiry.

ETag workflow:
1. Call `wm.get(key)` → receive `{value, etag}`
2. Modify value
3. Call `wm.put(key, value, if_match: previous_etag)` → if race, receive `-32000` → re-`wm.get` → retry

Response: `{key, etag, size_tokens}`.

Budget + eviction: entries contribute `size_tokens` (heuristic: bytes/4). When the total across all sessions exceeds `working_memory.max_tokens_per_scope` (default 10,000), the oldest entries (by `created_at`) are evicted in FIFO order. Eviction is synchronous within the same transaction.

## wm.get

Read a value from the working memory scratchpad. Expired entries return `-32602`.

```json
{
  "session_id": "research-session-001",
  "key": "current-topic"
}
```

TTL: if the entry has a `ttl_at` timestamp that has elapsed, the entry is soft-deleted on read and `-32602` is returned.

Response: `{key, value, etag, size_tokens, ttl_at}`.

## wm.list

List all active (non-expired, non-evicted) entries for a session.

```json
{"session_id": "research-session-001"}
```

Response: `{entries: {key, etag, size_tokens, ttl_at}[], total_tokens, budget_tokens}`.

TTL cleanup: expired entries are soft-deleted during the list scan and excluded from results.

## wm.delete

Soft-delete a working memory entry. Idempotent — calling twice succeeds both times.

```json
{
  "session_id": "research-session-001",
  "key": "current-topic"
}
```

Response: `{key, deleted: true}`.

### Design notes

Working Memory is independent of the memory index (no FTS5, no embedding, no vector search). It's a pure K/V store keyed by `(user_id, project_id, session_id, key)`. Eviction is across ALL sessions within a scope — agent A's stale entries can be evicted by agent B's fresh writes. Agents should use explicit `wm.delete` or TTL to clean up.