/**
 * MCP tool handler: `kg.get_node` (Phase 4 Plan 04).
 *
 * Thin wrapper over `KgService.getNode`: zod-parse args, resolve scope,
 * call service, translate `KgServiceError` to `McpError`.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromUserId } from "@agent-memories/shared"
import { KgGetNodeArgsSchema } from "../../schemas/kg.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { KgService } from "@agent-memories/shared"
import { KgServiceError } from "@agent-memories/shared"

export function makeGetNodeHandler(
  config: Config,
  service: KgService,
): ToolHandler {
  return {
    name: "kg.get_node",
    description:
      "Retrieve a knowledge graph node by id. Returns the node DTO with scope and provenance envelope, or throws an MCP error if the node is not found in the caller's scope.",
    inputSchema: sanitizeSchema(z.toJSONSchema(KgGetNodeArgsSchema)),
    async handle(args: unknown) {
      const parsed = KgGetNodeArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client", parsed.project_id);
      try {
        return await service.getNode(ctx, parsed.id);
      } catch (err) {
        if (err instanceof KgServiceError) {
          throw new McpError(err.code, err.message);
        }
        throw err;
      }
    },
  };
}
