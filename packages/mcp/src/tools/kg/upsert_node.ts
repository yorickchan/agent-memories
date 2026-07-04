/**
 * MCP tool handler: `kg.upsert_node` (Phase 4 Plan 04).
 *
 * Thin wrapper over `KgService.upsertNode`: zod-parse args, resolve scope,
 * call service, translate `KgServiceError` to `McpError`.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromConfigAndArg } from "@agent-memories/shared"
import { KgUpsertNodeArgsSchema } from "../../schemas/kg.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { KgService } from "@agent-memories/shared"
import { KgServiceError } from "@agent-memories/shared"

export function makeUpsertNodeHandler(
  config: Config,
  service: KgService,
): ToolHandler {
  return {
    name: "kg.upsert_node",
    description:
      "Create or update a typed node in the knowledge graph. Repeating the same (type, name) within the same scope returns the existing node id — node dedup on (type, name, scope).",
    inputSchema: sanitizeSchema(z.toJSONSchema(KgUpsertNodeArgsSchema)),
    async handle(args: unknown) {
      const parsed = KgUpsertNodeArgsSchema.parse(args);
      const ctx = scopeFromConfigAndArg(config, parsed.project_id);
      try {
        return await service.upsertNode(ctx, {
          type: parsed.type,
          name: parsed.name,
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
