---
name: agent-memories
description: Universal AI-agent memory server — memories, knowledge graph, and working memory over MCP. Any MCP-speaking agent connects via stdio.
---

# Agent Memories — MCP Proxy

A stateless MCP stdio proxy that translates MCP tool calls into REST API calls to an agent-memories backend. Published as `@agentmemories/mcp` on npm.

**This package requires a running agent-memories backend.** It does not include the backend itself — it is the MCP client layer only.

## Quick Install

```bash
npm install @agentmemories/mcp
# or
bun add @agentmemories/mcp
```

## Configuration

`AGENT_MEMORIES_HOST` and `AGENT_MEMORIES_API_KEY` are **required** — there are no hardcoded defaults. Set them in the `env` block of your MCP client config (not shell environment):

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "bunx",
      "args": ["@agentmemories/mcp"],
      "env": {
        "AGENT_MEMORIES_HOST": "http://127.0.0.1:8765",
        "AGENT_MEMORIES_API_KEY": "am_live_your-api-key"
      }
    }
  }
}
```

The proxy exits with code 78 at startup if `AGENT_MEMORIES_HOST` is missing.

### Environment variables

All variables are read from `process.env` — set them in your MCP client's `env` block.

| Variable                     | Required | Description                                                                                  |
| ---------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `AGENT_MEMORIES_HOST`        | **yes**  | Backend URL (full URL, e.g. `https://my-instance.example.com` or `http://127.0.0.1:8765`).   |
| `AGENT_MEMORIES_API_KEY`     | **yes**  | User API key (`am_live_...`) for authentication.                                             |
| `AGENT_MEMORIES_PORT`        | no       | Port override. Inferred from URL scheme when omitted (443 for `https://`, 80 for `http://`). |
| `AGENT_MEMORIES_SERVER_CORS_ORIGIN` | no | Sent as `Access-Control-Allow-Origin` by the backend, not the proxy. Rarely needed from the MCP client. |

## Using the Skill

This package ships as a **skill** — add it to your agent's skill directory so it's auto-discovered:

1. Copy `SKILL.md` (this file) and the `references/` directory into your agent's skill path (e.g. `~/.omp/agent/skills/agent-memories/`).
2. Configure the MCP server in your agent's MCP config (e.g. `~/.omp/agent/mcp.json`) with the `env` block above.
3. The agent will auto-discover the skill on next session and use agent-memories tools proactively.

### Auto-memory instructions

The skill includes agent-facing instructions for proactive memory use:

- Every major task → `memory.write` a summary
- New entity (file, function, module) discovered → `kg.upsert_node`
- Session context → `wm.put "context"`
- Before any task → `memory.search` for relevant context

## Architecture

```
Agent (MCP stdio)
  │
  ▼
MCP Client Proxy (`@agentmemories/mcp`)
  │  HTTP → backend REST API (AGENT_MEMORIES_HOST)
  ▼
Backend REST API
  │  MemoryService · KgService · WmService
  ▼
SQLite
```

The MCP proxy is fully stateless — no database access, no file I/O. It translates MCP tool invocations into HTTP calls and returns the results.

## Development

```bash
git clone <repo-url>
cd agent-memories
bun install
bun run build
```

```bash
# Run the MCP proxy locally
bun run agent-memories-mcp
```

## Verb Reference

- [Memory verbs](references/memory.md) — `memory.write`, `memory.search`, `memory.get`, `memory.update`, `memory.delete`, `memory.list`
- [Knowledge Graph verbs](references/kg.md) — `kg.upsert_node`, `kg.upsert_edge`, `kg.neighborhood`, `kg.get_node`, `kg.graph`, `kg.search`
- [Working Memory verbs](references/wm.md) — `wm.put`, `wm.get`, `wm.list`, `wm.delete`

## Semantic Search (Embeddings)

KG nodes and memories are embedded with `nomic-embed-text:latest` (768-D via Ollama) for semantic vector search. The backend runs an async `EmbedWorker` that drains `embedding_status='pending'` rows in batches — writes return immediately, embeddings land within ~500ms.

**KG semantic search** — `POST /api/kg/search` (or `kg.search` MCP verb):

```json
{
  "query": "container orchestration",
  "max_tokens": 500,
  "k": 50
}
```

Returns ranked hits by cosine similarity — finds nodes named "docker", "kubernetes" regardless of type or exact name match. Pure vector kNN over `name + props` embeddings; no FTS/RRF for KG nodes (unlike memories which use hybrid BM25+vector).

**Backend config** (`.env.toml` `[embedding]` block):

```toml
[embedding]
enabled = true
required = false
model = "nomic-embed-text:latest"
ollama_url = "http://127.0.0.1:11434"
dimensions = 768
```

When `enabled = false` or Ollama is unreachable, `kg.search` returns `503 ERR_KG_SEARCH_DISABLED`. Set `required = true` to refuse boot when Ollama is down.

**Re-embedding:** re-upserting a KG node with changed `props` resets `embedding_status` to `pending` — the worker re-embeds automatically. No-op re-upserts (same props) do NOT re-trigger embedding.

## License

MIT
