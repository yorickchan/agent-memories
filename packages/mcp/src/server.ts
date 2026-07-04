import type { Config } from "@agent-memories/shared"
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ToolRegistry } from "./router.js";

const SERVER_NAME = "agent-memories";
const SERVER_VERSION = "0.1.0";
export function createServer(_config: Config, tools: ToolRegistry): Server {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } },
  );

  // Auth is handled by the backend (server.api_key), not the MCP proxy.
  // The proxy runs as a local child process — the caller already has
  // filesystem access to the config file.

  server.setRequestHandler(ListToolsRequestSchema, async (_req) => {
    return tools.list();
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const handler = tools.get(req.params.name);
    if (!handler) {
      throw new McpError(-32601, "Method not found");
    }
    return {
      content: [
        { type: "text", text: JSON.stringify(await handler.handle(req.params.arguments)) },
      ],
    };
  });

  return server;
}

/**
 * Boot the full MCP stdio server: build it, mount a {@link StdioServerTransport},
 * and connect. Blocks for the lifetime of the server (D-16/D-17).
 *
 * stdout is the JSON-RPC channel — nothing here writes to stdout (D-20).
 */
export async function startServer(config: Config, tools: ToolRegistry): Promise<void> {
  const server = createServer(config, tools);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}