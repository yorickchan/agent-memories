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

Self-hosted:

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "bunx",
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

## Using the Skill

This package ships as a **skill**. To enable auto-discovery:

1. Copy `SKILL.md` and the `references/` directory into your agent's skill path (e.g. `~/.omp/agent/skills/agent-memories/`).
2. Configure the MCP server in your agent's MCP config (e.g. `~/.omp/agent/mcp.json`) with the `env` block above.
3. The agent auto-discovers the skill on next session and uses agent-memories tools proactively.

## Development

```bash
bun install
bun run build
bun run agent-memories-mcp
```

See [SKILL.md](SKILL.md) for the full MCP tool catalog and agent integration instructions.

## Packages

| Package                                      | Description                                 |
| -------------------------------------------- | ------------------------------------------- |
| [`@agentmemories/mcp`](packages/mcp/)        | MCP stdio proxy — the published npm package |
| [`@agent-memories/shared`](packages/shared/) | Shared types, DTOs, and service interfaces  |

## License

MIT
