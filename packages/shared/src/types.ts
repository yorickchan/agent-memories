// Config types shared between MCP proxy and backend.
// The MCP proxy builds a minimal Config from environment variables.

import { z } from "zod";

export const ServerConfigSchema = z.object({
  port: z.number().int().min(0).max(65535),
  host: z.string().min(1),
  cors_origin: z.string(),
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