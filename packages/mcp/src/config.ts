// Minimal env-based config for MCP client — no TOML dependency.
// Config shape matches the shared Config type (server.port + server.api_key).
import type { Config } from '@agent-memories/shared'

export function loadConfig(): Config {
  return {
    user_id: 'mcp-client', // placeholder — actual user_id comes from auth
    server: {
      host: process.env.AGENT_MEMORIES_HOST || 'https://agent-memories.com',
      port: parseInt(process.env.AGENT_MEMORIES_PORT || '443'),
      api_key: process.env.AGENT_MEMORIES_API_KEY || '',
    },
  }
}
