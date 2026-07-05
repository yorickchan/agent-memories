---
name: agent-memories
description: Universal AI-agent memory server — memories, knowledge graph, and working memory over MCP. Any MCP-speaking agent connects via stdio.
---

# Agent Memories — MCP Proxy

A stateless MCP stdio proxy that translates MCP tool calls into REST API calls to an agent-memories backend. Published as `@agentmemories/mcp` on npm. Defaults to `https://agent-memories.com` — no config needed for the hosted service.

**This package requires a running agent-memories backend.** It does not include the backend itself — provides the MCP client connection layer only.

## Quick Install

```bash
npm install @agentmemories/mcp
# or
bun add @agentmemories/mcp
```

Set environment variables to point at your backend:

```bash
# Required: your user API key
export AGENT_MEMORIES_API_KEY="am_live_your-api-key"

# Optional: point at a custom instance (defaults to https://agent-memories.com)
export AGENT_MEMORIES_HOST="https://memories.your-domain.com"

# Local dev
export AGENT_MEMORIES_HOST="http://127.0.0.1:8765"
```

## Environment Variables

| Variable                 | Default                      | Description                                                                             |
| ------------------------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| `AGENT_MEMORIES_HOST`    | `https://agent-memories.com` | Backend URL. Full URL used as-is; bare hostname gets `http://` + `AGENT_MEMORIES_PORT`. |
| `AGENT_MEMORIES_PORT`    | `8765`                       | Port for bare hostnames (ignored when `AGENT_MEMORIES_HOST` is a full URL).             |
| `AGENT_MEMORIES_API_KEY` | _(required)_                 | User API key (`am_live_...`).                                                           |

## MCP Client Config

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "bunx",
      "args": ["@agentmemories/mcp"],
      "env": {
        "AGENT_MEMORIES_API_KEY": "am_live_your-api-key"
      }
    }
  }
}
```

For a custom instance:

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "bunx",
      "args": ["@agentmemories/mcp"],
      "env": {
        "AGENT_MEMORIES_HOST": "https://my-instance.example.com",
        "AGENT_MEMORIES_API_KEY": "am_live_your-api-key"
      }
    }
  }
}
```

## Architecture

```
Agent (MCP stdio)
  │
  ▼
MCP Client Proxy (`@agentmemories/mcp`)
  │  HTTP → backend REST API (default: https://agent-memories.com)
  ▼
Backend REST API (external)
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
- [Knowledge Graph verbs](references/kg.md) — `kg.upsert_node`, `kg.upsert_edge`, `kg.neighborhood`, `kg.get_node`, `kg.graph`
- [Working Memory verbs](references/wm.md) — `wm.put`, `wm.get`, `wm.list`, `wm.delete`

## Agent Auto-Memory Instructions

Add to your system prompt or CLAUDE.md:

```markdown
Use agent-memories tools proactively:

- Every major task → memory.write summary
- New entity discovered → kg.upsert_node
- Session context → wm.put "context"
- Before any task → memory.search relevant context
```

## License

MIT
