/**
 * MCP tool handler: `memory.delete` (Phase 2 Plan 05).
 *
 * Soft-delete: sets tombstoned=1 and bumps updated_at (D-2.60). Row + FTS
 * entry are retained so search/list hide it while memory.get can still
 * surface it for undo workflows.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromUserId } from "@agent-memories/shared"
import { MemoryDeleteArgsSchema } from "../../schemas/memory.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { MemoryService } from "@agent-memories/shared"
import { MemoryServiceError } from "@agent-memories/shared"

export function makeDeleteHandler(
  config: Config,
  service: MemoryService,
): ToolHandler {
  return {
    name: "memory.delete",
    description:
      "Soft-delete a memory by id. Row + FTS entry retained; tombstoned=true so search/list hide it. Undo via memory.get + memory.update.",
    inputSchema: sanitizeSchema(z.toJSONSchema(MemoryDeleteArgsSchema)),
    async handle(args: unknown) {
      const parsed = MemoryDeleteArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client", parsed.project_id);
      try {
        return service.delete(ctx, parsed.id);
      } catch (err) {
        if (err instanceof MemoryServiceError) {
          throw new McpError(err.code, err.message);
        }
        throw err;
      }
    },
  };
}
