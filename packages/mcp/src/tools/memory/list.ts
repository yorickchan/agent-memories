/**
 * MCP tool handler: `memory.list` (Phase 2 Plan 05).
 *
 * Newest-first pagination via opaque base64url cursor (D-2.70..73). Zod
 * schema defaults `limit=50`, `strict_scope=false`, `include_tombstoned=false`,
 * so the service never receives `undefined` for those knobs.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromUserId } from "@agent-memories/shared"
import { MemoryListArgsSchema } from "../../schemas/memory.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { MemoryService } from "@agent-memories/shared"
import { MemoryServiceError } from "@agent-memories/shared"

export function makeListHandler(
  config: Config,
  service: MemoryService,
): ToolHandler {
  return {
    name: "memory.list",
    description:
      "List memories in scope, newest first, with opaque cursor pagination. Default limit 50 (max 500). include_tombstoned surfaces soft-deleted rows.",
    inputSchema: sanitizeSchema(z.toJSONSchema(MemoryListArgsSchema)),
    async handle(args: unknown) {
      const parsed = MemoryListArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client", parsed.project_id);
      try {
        return service.list(ctx, {
          limit: parsed.limit,
          strict_scope: parsed.strict_scope,
          include_tombstoned: parsed.include_tombstoned,
          ...(parsed.cursor !== undefined ? { cursor: parsed.cursor } : {}),
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
