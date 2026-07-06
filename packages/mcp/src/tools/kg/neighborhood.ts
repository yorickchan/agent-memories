/**
 * MCP tool handler: `kg.neighborhood` (Phase 4 Plan 04).
 *
 * Thin wrapper over `KgService.neighborhood`: zod-parse args, resolve scope,
 * call service, translate `KgServiceError` to `McpError`.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromUserId } from "@agent-memories/shared"
import { KgNeighborhoodArgsSchema } from "../../schemas/kg.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { KgService } from "@agent-memories/shared"
import { KgServiceError } from "@agent-memories/shared"

export function makeNeighborhoodHandler(
  config: Config,
  service: KgService,
): ToolHandler {
  return {
    name: "kg.neighborhood",
    description:
      "Traverse the graph neighborhood around a node. Returns the node, its outgoing edges with neighbor nodes, and metadata including the traversal depth and whether token budget truncated the result.",
    inputSchema: sanitizeSchema(z.toJSONSchema(KgNeighborhoodArgsSchema)),
    async handle(args: unknown) {
      const parsed = KgNeighborhoodArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client", parsed.project_id);
      try {
        return await service.neighborhood(ctx, {
          node_id: parsed.node_id,
          depth: parsed.depth,
          max_tokens: parsed.max_tokens,
          ...(parsed.strict_scope !== undefined
            ? { strict_scope: parsed.strict_scope }
            : {}),
        });
      } catch (err) {
        if (err instanceof KgServiceError) {
          throw new McpError(err.code, err.message);
        }
        throw err;
      }
    },
  };
}
