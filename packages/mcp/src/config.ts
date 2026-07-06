// Minimal env-based config for MCP client — no TOML dependency.
import type { Config } from '@agent-memories/shared'

export function loadConfig(): Config {
  const host = process.env.AGENT_MEMORIES_HOST;
  if (!host) {
    process.stderr.write(
      "fatal: AGENT_MEMORIES_HOST is required (set it to your backend URL, e.g. https://your-backend.example)\n",
    );
    process.exit(78);
  }
  const port = process.env.AGENT_MEMORIES_PORT
    ? parseInt(process.env.AGENT_MEMORIES_PORT, 10)
    : (host.startsWith("https://") ? 443 : 80);
  return {
    api_key: process.env.AGENT_MEMORIES_API_KEY || '',
    server: {
      host,
      port,
      cors_origin: process.env.AGENT_MEMORIES_SERVER_CORS_ORIGIN || '',
    },
  }
}
