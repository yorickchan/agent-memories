# @agentmemories/mcp

> Universal AI-agent memory — MCP client for agent-memories server. v1.2.

Drop-in MCP server that connects any MCP-speaking AI agent to an agent-memories backend. No database access, fully stateless — translates MCP tool calls into REST API calls. Authenticates with per-user API keys.

## Install

```bash
npm install @agentmemories/mcp
# or
bun add @agentmemories/mcp
```

## Configure

`AGENT_MEMORIES_HOST` and `AGENT_MEMORIES_API_KEY` are **required** — there are no hardcoded defaults. Set them in the `env` block of your MCP client config.

### Claude Code / Claude Desktop / OMP

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
bunx @agentmemories/mcp
```

## Tools

See [SKILL.md](./SKILL.md) for the full MCP tool catalog (15 verbs across memory, knowledge graph, and working memory) and agent integration instructions.

## License

MIT
