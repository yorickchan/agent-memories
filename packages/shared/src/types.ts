// Config types shared between MCP proxy and backend.
// The MCP proxy builds a minimal Config from environment variables.

import { z } from "zod";

export const ServerConfigSchema = z.object({
  port: z.number().int().min(0).max(65535).default(8765),
  host: z.string().min(1).default("127.0.0.1"),
  api_key: z.string().min(32, "server.api_key must be at least 32 characters"),
}).strict();
export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export const ConfigSchema = z
  .object({
    user_id: z.string().min(1),
    server: ServerConfigSchema,
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;
