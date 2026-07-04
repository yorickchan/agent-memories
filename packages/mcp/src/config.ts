// Minimal env-based config for MCP client — no TOML dependency.
// Config shape matches the shared Config type (server.port + server.api_key).
import type { Config } from "@agent-memories/shared";

export function loadConfig(): Config {
  return {
    user_id: "mcp-client", // placeholder — actual user_id comes from auth
    auth_token: process.env.AGENT_MEMORIES_AUTH_TOKEN || "",
    server: {
      host: "127.0.0.1",
      port: parseInt(process.env.AGENT_MEMORIES_PORT || "8765"),
      api_key: process.env.AGENT_MEMORIES_API_KEY || "",
    },
  };
}
