# @agentmemories/mcp

> Universal AI-agent memory — MCP client for agent-memories server. v1.2.

Drop-in MCP server that connects any MCP-speaking AI agent to an agent-memories backend. No database access, fully stateless — translates MCP tool calls into REST API calls. Supports user API keys (v1.1) and legacy server API key auth.

## Install

```bash
npm install @agentmemories/mcp
# or
bun add @agentmemories/mcp
```

## Configure

Set environment variables to point at your agent-memories backend. Defaults to `https://agent-memories.com` — no config needed for the hosted service.

```bash
# Required: your user API key
export AGENT_MEMORIES_API_KEY="am_live_your-api-key"
```

**Local dev** — point at a local backend:

```bash
export AGENT_MEMORIES_HOST="http://127.0.0.1:8765"
export AGENT_MEMORIES_API_KEY="am_live_your-api-key"
```

**Self-hosted** — point at your own instance:

```bash
export AGENT_MEMORIES_HOST="https://memories.your-domain.com"
export AGENT_MEMORIES_API_KEY="am_live_your-api-key"
```

### Environment variables

| Variable                 | Default                      | Description                                                                                             |
| ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `AGENT_MEMORIES_HOST`    | `https://agent-memories.com` | Backend URL. Full URL (`https://...`) used as-is; bare hostname gets `http://` + `AGENT_MEMORIES_PORT`. |
| `AGENT_MEMORIES_PORT`    | `8765`                       | Port appended to bare hostnames (ignored when `AGENT_MEMORIES_HOST` is a full URL).                     |
| `AGENT_MEMORIES_API_KEY` | _(required)_                 | User API key (`am_live_...`) for authentication.                                                        |

## Usage

### Claude Code / Claude Desktop

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

For a custom instance, add `AGENT_MEMORIES_HOST`:

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

### Direct

```bash
bunx @agentmemories/mcp
```

## Tools

See [SKILL.md](./SKILL.md) for the full MCP tool catalog (14 verbs across memory, knowledge graph, and working memory).

## License

MIT
