# Agent Memories — MCP Proxy

> Stateless MCP stdio proxy for the agent-memories memory server.

`@agent-memories/mcp` translates MCP tool calls into REST API requests to a running agent-memories backend. It provides 14 MCP tools across three domains:

| Domain | Tools |
|--------|-------|
| Memory | `write`, `search`, `get`, `update`, `delete`, `list` |
| Knowledge Graph | `upsert_node`, `upsert_edge`, `neighborhood`, `get_node`, `graph` |
| Working Memory | `put`, `get`, `list`, `delete` |

## Install

```bash
npm install @agent-memories/mcp
```

## Configure

```bash
export AGENT_MEMORIES_PORT=8765
export AGENT_MEMORIES_API_KEY="your-backend-api-key"
export AGENT_MEMORIES_AUTH_TOKEN="your-agent-auth-token"
```

## Usage

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

## Development

```bash
bun install
bun run build
bun run agent-memories-mcp
```

See [SKILL.md](SKILL.md) for the full MCP tool catalog and agent integration instructions.

## Packages

| Package | Description |
|---------|-------------|
| [`@agent-memories/mcp`](packages/mcp/) | MCP stdio proxy — the published npm package |
| [`@agent-memories/shared`](packages/shared/) | Shared types, DTOs, and service interfaces |

## License

MIT
