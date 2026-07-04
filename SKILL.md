---
name: agent-memories
description: Universal AI-agent memory server — memories, knowledge graph, and working memory over MCP. Any MCP-speaking agent connects via stdio.
---

# Agent Memories — MCP Proxy

A stateless MCP stdio proxy that translates MCP tool calls into REST API calls to an agent-memories backend. Published as `@agent-memories/mcp` on npm.

**This package requires a running agent-memories backend.** It does not include the backend itself — it is the MCP client layer only.

## Quick Install

```bash
npm install @agent-memories/mcp
# or
bun add @agent-memories/mcp
```

Set environment variables to point at your backend:

```bash
export AGENT_MEMORIES_PORT=8765
export AGENT_MEMORIES_API_KEY="your-backend-api-key"
export AGENT_MEMORIES_AUTH_TOKEN="your-agent-auth-token"
```

## MCP Client Config

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "npx",
      "args": ["@agent-memories/mcp"],
      "env": {
        "AGENT_MEMORIES_PORT": "8765",
        "AGENT_MEMORIES_API_KEY": "am_live_your-api-key",
        "AGENT_MEMORIES_AUTH_TOKEN": "your-auth-token"
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
MCP Client Proxy (`@agent-memories/mcp`)
  │  HTTP → backend REST API
  ▼
Backend REST API (external, 127.0.0.1:8765)
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

- [Memory verbs](packages/mcp/references/memory.md) — `memory.write`, `memory.search`, `memory.get`, `memory.update`, `memory.delete`, `memory.list`
- [Knowledge Graph verbs](packages/mcp/references/kg.md) — `kg.upsert_node`, `kg.upsert_edge`, `kg.neighborhood`, `kg.get_node`, `kg.graph`
- [Working Memory verbs](packages/mcp/references/wm.md) — `wm.put`, `wm.get`, `wm.list`, `wm.delete`
- [REST API reference](packages/mcp/references/rest-api.md)

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
