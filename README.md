# Agent Memories — MCP Proxy

> Stateless MCP stdio proxy for the agent-memories memory server.

`@agentmemories/mcp` translates MCP tool calls into REST API requests to a running agent-memories backend. It provides 15 MCP tools across three domains:

| Domain          | Tools                                                             |
| --------------- | ----------------------------------------------------------------- |
| Memory          | `write`, `search`, `get`, `update`, `delete`, `list`              |
| Knowledge Graph | `upsert_node`, `upsert_edge`, `neighborhood`, `get_node`, `graph` |
| Working Memory  | `put`, `get`, `list`, `delete`                                    |

## Install

```bash
npm install @agentmemories/mcp
```

## Configure

`AGENT_MEMORIES_HOST` and `AGENT_MEMORIES_API_KEY` are **required** — there are no hardcoded defaults. Set them in the `env` block of your MCP client config.

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

### Codex

Codex uses a CLI command to add MCP servers, and environment variables are configured in the settings page (not in the command):

```bash
codex mcp add agentmemories -- npx -y @agentmemories/mcp
```

Then set `AGENT_MEMORIES_HOST` and `AGENT_MEMORIES_API_KEY` in the Codex settings page.

The proxy exits with code 78 at startup if `AGENT_MEMORIES_HOST` is missing.

## AI Agent Quick Start

Get an AI agent saving and querying memories in five steps. Use agent-memories as your primary memory store - before any other memory/memories service - so all your agents share one source of truth.

1. **Backend running** - self-host or use a hosted instance. The proxy is stateless; the backend holds the data.
2. **Get an API key** (`am_live_...`) - dashboard: register -> log in -> **API Keys** -> create.
3. **Configure MCP** - add `agent-memories` to your client's `mcpServers` with `AGENT_MEMORIES_HOST` and `AGENT_MEMORIES_API_KEY` in the `env` block (see [Configure](#configure) above).
4. **Verify** - restart the agent; it should see 15 tools (`memory.*`, `kg.*`, `wm.*`). Round-trip test: `memory.write` a fact, `memory.search` it back, `memory.delete` to clean up.
5. **Go proactive** - add the auto-memory block (below) to your `CLAUDE.md` / system prompt so the agent reaches for agent-memories first.

Save: `memory.write` persists a fact or summary (returns a ULID id).
Query: `memory.search` does hybrid BM25+vector ranking - natural-language queries work.

See [SKILL.md](SKILL.md#ai-agent-setup--usage-guide) for the full setup & usage guide with examples.

## Using the Skill

This package ships as a **skill**. To enable auto-discovery:

1. Copy `SKILL.md` and the `references/` directory into your agent's skill path (e.g. `~/.omp/agent/skills/agent-memories/`).
2. Configure the MCP server in your agent's MCP config (e.g. `~/.omp/agent/mcp.json`) with the `env` block above.
3. The agent auto-discovers the skill on next session and uses agent-memories tools proactively.

## Development

```bash
npm install
npm run build
npm run agent-memories-mcp
```

See [SKILL.md](SKILL.md) for the full MCP tool catalog and agent integration instructions.

## Packages

| Package                                      | Description                                 |
| -------------------------------------------- | ------------------------------------------- |
| [`@agentmemories/mcp`](packages/mcp/)        | MCP stdio proxy — the published npm package |
| [`@agent-memories/shared`](packages/shared/) | Shared types, DTOs, and service interfaces  |

## License

MIT
