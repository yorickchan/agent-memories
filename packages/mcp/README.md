# @agent-memories/mcp

> Universal AI-agent memory — MCP client for agent-memories server. v1.1.

Drop-in MCP server that connects any MCP-speaking AI agent to an agent-memories backend. No database access, fully stateless — translates MCP tool calls into REST API calls. Supports user API keys (v1.1) and legacy server API key auth.

## Install

```bash
npm install @agent-memories/mcp
# or
bun add @agent-memories/mcp
```

## Configure

Set environment variables to point at your agent-memories backend:

```bash
# Backend connection
export AGENT_MEMORIES_PORT=8765
export AGENT_MEMORIES_API_KEY="your-user-api-key"    # user API key (am_live_...)
```

Get a user API key by registering with the backend:

```bash
curl -X POST http://127.0.0.1:8765/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}'
```

## Usage

### Claude Code / Claude Desktop

```json
{
  "mcpServers": {
    "agent-memories": {
      "command": "bunx",
      "args": ["@agent-memories/mcp"],
      "env": {
        "AGENT_MEMORIES_PORT": "8765",
        "AGENT_MEMORIES_API_KEY": "am_live_your-api-key"
      }
    }
  }
}
```

### Direct

```bash
bunx @agent-memories/mcp
```

## Dashboard

Visit `http://127.0.0.1:8765` for the web dashboard — login, browse memories, and explore the knowledge graph interactively.

## Tools

See [SKILL.md](./SKILL.md) for the full MCP tool catalog (14 verbs across memory, knowledge graph, and working memory).

## License

MIT
