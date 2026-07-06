/**
 * MCP tool handler: `memory.get` (Phase 2 Plan 05).
 *
 * Thin wrapper over `MemoryService.get`. Scope-filtered — a stale id
 * from another project MUST NOT return the body; service raises
 * `-32602 "Memory not found in scope"` on any miss.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromUserId } from "@agent-memories/shared"
import { MemoryGetArgsSchema } from "../../schemas/memory.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { MemoryService } from "@agent-memories/shared"
import { MemoryServiceError } from "@agent-memories/shared"

export function makeGetHandler(
  config: Config,
  service: MemoryService,
): ToolHandler {
  return {
    name: "memory.get",
    description:
      "Fetch a memory's full body + provenance envelope by id. Scope-filtered; returns -32602 if not visible in scope.",
    inputSchema: sanitizeSchema(z.toJSONSchema(MemoryGetArgsSchema)),
    async handle(args: unknown) {
      const parsed = MemoryGetArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client", parsed.project_id);
      try {
        return service.get(ctx, parsed.id);
      } catch (err) {
        if (err instanceof MemoryServiceError) {
          throw new McpError(err.code, err.message);
        }
        throw err;
      }
    },
  };
}
