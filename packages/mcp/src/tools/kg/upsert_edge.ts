/**
 * MCP tool handler: `kg.upsert_edge` (Phase 4 Plan 04).
 *
 * Thin wrapper over `KgService.upsertEdge`: zod-parse args, resolve scope,
 * call service, translate `KgServiceError` to `McpError`.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromConfigAndArg } from "@agent-memories/shared"
import { KgUpsertEdgeArgsSchema } from "../../schemas/kg.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { KgService } from "@agent-memories/shared"
import { KgServiceError } from "@agent-memories/shared"

export function makeUpsertEdgeHandler(
  config: Config,
  service: KgService,
): ToolHandler {
  return {
    name: "kg.upsert_edge",
    description:
      "Create or update a directed edge between two knowledge graph nodes. Repeating the same (subject, predicate, object) within the same scope returns the existing edge id.",
    inputSchema: sanitizeSchema(z.toJSONSchema(KgUpsertEdgeArgsSchema)),
    async handle(args: unknown) {
      const parsed = KgUpsertEdgeArgsSchema.parse(args);
      const ctx = scopeFromConfigAndArg(config, parsed.project_id);
      try {
        return await service.upsertEdge(ctx, {
          subject_id: parsed.subject_id,
          predicate: parsed.predicate,
          object_id: parsed.object_id,
          ...(parsed.props !== undefined ? { props: parsed.props } : {}),
          source_agent: config.user_id,
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
