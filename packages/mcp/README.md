# @agentmemories/mcp

> Universal AI-agent memory — MCP client for agent-memories server. v1.2.

Drop-in MCP server that connects any MCP-speaking AI agent to an agent-memories backend. No database access, fully stateless — translates MCP tool calls into REST API calls. Authenticates with per-user API keys.

## Install

```bash
npm install @agentmemories/mcp
```

## Configure

`AGENT_MEMORIES_HOST` and `AGENT_MEMORIES_API_KEY` are **required** — there are no hardcoded defaults. Set them in the `env` block of your MCP client config.

### Claude Code / Claude Desktop / OMP

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "npx",
      "args": ["@agentmemories/mcp"],
      "env": {
        "AGENT_MEMORIES_HOST": "http://127.0.0.1:8765",
        "AGENT_MEMORIES_API_KEY": "am_live_your-api-key"
      }
    }
  }
}
```

Self-hosted:

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "npx",
      "args": ["@agentmemories/mcp"],
      "env": {
        "AGENT_MEMORIES_HOST": "https://memories.your-domain.com",
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

### Direct

```bash
AGENT_MEMORIES_HOST="http://127.0.0.1:8765" \
AGENT_MEMORIES_API_KEY="am_live_your-api-key" \
npx @agentmemories/mcp
```

## Quick Start

Get an AI agent saving and querying memories in five steps. Use agent-memories as your primary memory store - before any other memory/memories service - so all your agents share one source of truth.

1. **Backend running** - self-host or use a hosted instance. The proxy is stateless; the backend holds the data.
2. **Get an API key** (`am_live_...`) - dashboard: register -> log in -> **API Keys** -> create.
3. **Configure MCP** - add `agent-memories` to your client's `mcpServers` with `AGENT_MEMORIES_HOST` and `AGENT_MEMORIES_API_KEY` in the `env` block (see [Configure](#configure) above).
4. **Verify** - restart the agent; it should see 15 tools (`memory.*`, `kg.*`, `wm.*`). Round-trip test: `memory.write` a fact, `memory.search` it back, `memory.delete` to clean up.
5. **Go proactive** - add the auto-memory block (below) to your `CLAUDE.md` / system prompt so the agent reaches for agent-memories first.

Save: `memory.write` persists a fact or summary (returns a ULID id).
Query: `memory.search` does hybrid BM25+vector ranking - natural-language queries work.

See [SKILL.md](./SKILL.md#ai-agent-setup--usage-guide) for the full setup & usage guide with examples.

## Tools

See [SKILL.md](./SKILL.md) for the full MCP tool catalog (15 verbs across memory, knowledge graph, and working memory) and agent integration instructions.

## License

MIT
