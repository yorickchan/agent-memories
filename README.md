# Agent Memories — MCP Proxy

> Stateless MCP stdio proxy for the agent-memories memory server.

`@agentmemories/mcp` translates MCP tool calls into REST API requests to a running agent-memories backend. Defaults to `https://agent-memories.com` — no config needed for the hosted service. It provides 14 MCP tools across three domains:

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

```bash
# Required: your user API key
export AGENT_MEMORIES_API_KEY="am_live_your-api-key"

# Optional: point at a custom instance (defaults to https://agent-memories.com)
export AGENT_MEMORIES_HOST="https://memories.your-domain.com"

# Or for local dev:
export AGENT_MEMORIES_HOST="http://127.0.0.1:8765"
```

## MCP Configuration

Add to your MCP client config (Claude Desktop, Claude Code, etc.):

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "bunx",
      "args": ["-y", "@agentmemories/mcp"],
      "env": {
        "AGENT_MEMORIES_API_KEY": "am_live_your-api-key"
      }
    }
  }
}
```

For a custom instance, add `AGENT_MEMORIES_HOST`:

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "bunx",
      "args": ["-y", "@agentmemories/mcp"],
      "env": {
        "AGENT_MEMORIES_HOST": "https://my-instance.example.com",
        "AGENT_MEMORIES_API_KEY": "am_live_your-api-key"
      }
    }
  }
}
```

Or run directly:

```bash
npx @agentmemories/mcp
```

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
