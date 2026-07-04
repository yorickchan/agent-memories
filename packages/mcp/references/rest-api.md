# REST API Reference

All endpoints require `Authorization: Bearer <server.api_key>` except `/health`.

## Health

```bash
curl http://127.0.0.1:8765/health
# → {"status":"ok"}
```

## Memory

### memory.write

```bash
curl -X POST http://127.0.0.1:8765/api/memories \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"Remember this","source_agent":"my-agent","tags":["important"]}'
# → 201 {"id":"...","content":"Remember this","tags":["important"],"tombstoned":false,...}
```

### memory.search

```bash
curl -X POST http://127.0.0.1:8765/api/memories/search \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"Remember","max_tokens":500}'
# → 200 {"hits":[{"id":"...","snippet":"[Remember] ...","score":0.05,...}],"truncated":false}
```

### memory.get

```bash
curl http://127.0.0.1:8765/api/memories/<id> \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"id":"...","content":"...","tombstoned":false,...}
# → 404 {"error":{"code":404,"message":"Memory not found in scope"}}
```

### memory.update

```bash
curl -X PATCH http://127.0.0.1:8765/api/memories/<id> \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated content"}'
# → 200 {"id":"...","content":"Updated content",...}
# → 404 {"error":{"code":404,"message":"Memory not found in scope"}}
# → 409 {"error":{"code":409,"message":"Precondition failed"}}
```

### memory.delete

```bash
curl -X DELETE http://127.0.0.1:8765/api/memories/<id> \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"id":"...","tombstoned":true,"updated_at":"..."}
# → 404 {"error":{"code":404,"message":"Memory not found in scope"}}
```

### memory.list

```bash
curl "http://127.0.0.1:8765/api/memories?limit=10&project_id=my-project" \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"items":[...],"next_cursor":"..."}
```

## Knowledge Graph

### kg.upsertNode

```bash
curl -X POST http://127.0.0.1:8765/api/kg/nodes \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type":"Function","name":"processItem","source_agent":"agent-1","project_id":"my-project"}'
# → 201 {"id":"...","type":"function","name":"processitem",...}
```

### kg.upsertEdge

```bash
curl -X POST http://127.0.0.1:8765/api/kg/edges \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"subject_id":"<node1-id>","predicate":"calls","object_id":"<node2-id>","source_agent":"agent-1"}'
# → 201 {"id":"...","subject_id":"...","predicate":"calls","object_id":"...",...}
```

### kg.getNode

```bash
curl "http://127.0.0.1:8765/api/kg/nodes/<id>?project_id=my-project" \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"id":"...","type":"function","name":"processitem",...}
# → 404 {"error":{"code":404,"message":"..."}}
```

### kg.neighborhood

```bash
curl "http://127.0.0.1:8765/api/kg/nodes/<id>/neighborhood?project_id=my-project&max_tokens=2000" \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"node":{...},"edges":[...],"depth":2,"total_edges_discovered":3}
# → 404 {"error":{"code":404,"message":"..."}}
```

### kg.graph

```bash
curl "http://127.0.0.1:8765/api/kg/graph?project_id=my-project&format=mermaid" \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"mermaid":"flowchart LR\n  n12345678[\"server.ts\"]\n  n87654321[\"helpers.ts\"]\n  n12345678 -->|imports| n87654321\n..."}
```

Format `json` returns raw `{ nodes: [...], edges: [...] }`.

## Working Memory

### wm.put

```bash
curl -X PUT http://127.0.0.1:8765/api/wm/my-session/my-key \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":"temporary data","if_match":"","ttl_seconds":3600}'
# → 200 {"key":"my-key","etag":"...","size_tokens":2}
# → 409 {"error":{"code":409,"message":"ETag mismatch"}}
```

### wm.get

```bash
curl http://127.0.0.1:8765/api/wm/my-session/my-key \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"key":"my-key","value":"temporary data","etag":"...","size_tokens":2,"ttl_at":"..."}
# → 404 {"error":{"code":404,"message":"Working memory entry not found"}}
```

### wm.list

```bash
curl http://127.0.0.1:8765/api/wm/my-session \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"entries":[...],"total_tokens":5,"budget_tokens":10000}
```

### wm.delete

```bash
curl -X DELETE http://127.0.0.1:8765/api/wm/my-session/my-key \
  -H "Authorization: Bearer $API_KEY"
# → 200 {"key":"my-key","deleted":true}
```

## Error Responses

All errors use the format `{"error":{"code":<http_status>,"message":"<description>"}}`.

| HTTP Status | Meaning |
|-------------|---------|
| 401 | Missing or invalid API key |
| 404 | Resource not found in scope |
| 409 | Conflict (ETag mismatch, already exists) |
| 500 | Internal server error |

## Auth Endpoints (v1.1)

### POST /api/auth/register
Register a new user. Returns user + first API key (plaintext shown once).

```bash
curl -X POST http://127.0.0.1:8765/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}'
# → 201 {"user":{"id":"...","email":"..."},"apiKey":{"id":"...","key":"am_live_...","prefix":"am_live_"}}
```

### POST /api/auth/login
Login with email + password. Returns API key for use in Authorization header.

```bash
curl -X POST http://127.0.0.1:8765/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}'
# → 200 {"apiKey":"am_live_..."}
```

Rate limited: 5 attempts per 60 seconds per IP.

### POST /api/auth/keys
Create a new API key. Requires Authorization header with a valid API key.

```bash
curl -X POST http://127.0.0.1:8765/api/auth/keys \
  -H "Authorization: Bearer am_live_..." \
  -H "Content-Type: application/json" \
  -d '{"name":"my-key"}'
# → 201 {"id":"...","key":"am_live_...","prefix":"am_live_"}
```

### GET /api/auth/keys
List API keys for authenticated user. Key values are never returned — only prefix + metadata.

```bash
curl http://127.0.0.1:8765/api/auth/keys \
  -H "Authorization: Bearer am_live_..."
# → 200 [{"id":"...","prefix":"am_live_****","name":"my-key","created_at":"...","last_used_at":"..."}]
```

### DELETE /api/auth/keys/:id
Revoke an API key.

```bash
curl -X DELETE http://127.0.0.1:8765/api/auth/keys/<key-id> \
  -H "Authorization: Bearer am_live_..."
# → 204 No Content
```

### POST /api/auth/verify
Verify an API key. Used by MCP proxy and middleware. Not rate-limited for internal use.

```bash
curl -X POST http://127.0.0.1:8765/api/auth/verify \
  -H "Authorization: Bearer am_live_..."
# → 200 {"user_id":"..."}
# Invalid key → 401 {"error":{"code":"invalid_key","message":"Invalid or revoked API key"}}
```
