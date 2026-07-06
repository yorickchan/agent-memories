/**
 * MCP tool handler: `memory.update` (Phase 2 Plan 05).
 *
 * PATCH semantics: missing fields untouched; explicit null on `tags` clears
 * them (D-2.50). Optional `if_updated_at` gates optimistic concurrency
 * (D-2.52).
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromUserId } from "@agent-memories/shared"
import { MemoryUpdateArgsSchema } from "../../schemas/memory.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { MemoryService } from "@agent-memories/shared"
import { MemoryServiceError } from "@agent-memories/shared"

export function makeUpdateHandler(
  config: Config,
  service: MemoryService,
): ToolHandler {
  return {
    name: "memory.update",
    description:
      "PATCH a memory by id. Missing fields = untouched; explicit null on tags clears them. Optional if_updated_at ETag for optimistic concurrency.",
    inputSchema: sanitizeSchema(z.toJSONSchema(MemoryUpdateArgsSchema)),
    async handle(args: unknown) {
      const parsed = MemoryUpdateArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client", parsed.project_id);
      try {
        return service.update(ctx, {
          id: parsed.id,
          ...(parsed.content !== undefined ? { content: parsed.content } : {}),
          // `null` (explicit clear) must be forwarded; only `undefined` skips.
          ...(parsed.tags !== undefined ? { tags: parsed.tags } : {}),
          ...(parsed.if_updated_at !== undefined
            ? { if_updated_at: parsed.if_updated_at }
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
