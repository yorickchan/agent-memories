/**
 * MCP tool handler: `kg.graph` (v2.0).
 *
 * Thin wrapper over `KgService.graph`: zod-parse args, resolve scope,
 * call service, translate `KgServiceError` to `McpError`.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromConfigAndArg } from "@agent-memories/shared"
import { KgGraphArgsSchema } from "../../schemas/kg.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { KgService } from "@agent-memories/shared"
import { KgServiceError } from "@agent-memories/shared"

export function makeGraphHandler(
  config: Config,
  service: KgService,
): ToolHandler {
  return {
    name: "kg.graph",
    description:
      "Return the full project knowledge graph as a Mermaid flowchart or raw JSON. Use `format: \"mermaid\"` to get a renderable diagram string showing nodes and their relationships, or `format: \"json\"` for the raw { nodes, edges } data.",
    inputSchema: sanitizeSchema(z.toJSONSchema(KgGraphArgsSchema)),
    async handle(args: unknown) {
      const parsed = KgGraphArgsSchema.parse(args);
      const ctx = scopeFromConfigAndArg(config, parsed.project_id);
      try {
        return await service.graph(ctx, {
          format: parsed.format,
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
