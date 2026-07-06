// Minimal env-based config for MCP client — no TOML dependency.
import type { Config } from '@agent-memories/shared'

export function loadConfig(): Config {
  return {
    api_key: process.env.AGENT_MEMORIES_API_KEY || '',
    server: {
      host: process.env.AGENT_MEMORIES_HOST || 'https://agent-memories.com',
      port: parseInt(process.env.AGENT_MEMORIES_PORT || '443'),
      cors_origin: '',
    },
  }
}
