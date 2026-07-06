/**
 * MCP tool handler: `memory.write` (Phase 2 Plan 05).
 *
 * Thin wrapper over `MemoryService.write`: zod-parse args, resolve scope,
 * call service, translate `MemoryServiceError` to `McpError`.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromUserId } from "@agent-memories/shared"
import { MemoryWriteArgsSchema } from "../../schemas/memory.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { MemoryService } from "@agent-memories/shared"
import { MemoryServiceError } from "@agent-memories/shared"

export function makeWriteHandler(
  config: Config,
  service: MemoryService,
): ToolHandler {
  return {
    name: "memory.write",
    description:
      "Persist a memory (content + optional tags) under the caller's scope. Returns the DTO with server-generated id + timestamps.",
    inputSchema: sanitizeSchema(z.toJSONSchema(MemoryWriteArgsSchema)),
    async handle(args: unknown) {
      const parsed = MemoryWriteArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client", parsed.project_id);
      try {
        return await service.write(ctx, {
          content: parsed.content,
          source_agent: parsed.source_agent,
          ...(parsed.tags !== undefined ? { tags: parsed.tags } : {}),
          ...(parsed.session_id !== undefined
            ? { session_id: parsed.session_id }
            : {}),
        });
      } catch (err) {
        if (err instanceof MemoryServiceError) {
          throw new McpError(err.code, err.message);
        }
        throw err;
      }
    },
  };
}
