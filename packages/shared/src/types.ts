// Config types shared between MCP proxy and backend.
// The MCP proxy builds a minimal Config from environment variables.

import { z } from "zod";

export const ServerConfigSchema = z.object({
  port: z.number().int().min(0).max(65535).default(8765),
  host: z.string().min(1).default("127.0.0.1"),
  cors_origin: z.string().optional().default("http://localhost:5173"),
}).strict();
export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export const ConfigSchema = z
  .object({
    secret: z.string().optional(),
    api_key: z.string().default(""),
    server: ServerConfigSchema,
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;