/**
 * MCP tool handler: `memory.search` (Phase 2 Plan 05).
 *
 * Thin wrapper over `MemoryService.search`. Zod schema already applies
 * `max_tokens` default (MAX_TOKENS_DEFAULT) and `strict_scope` default,
 * so the service never sees `undefined` for either.
 */
import { z } from "zod";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type { ToolHandler } from "../../router.js";
import type { Config } from "@agent-memories/shared"
import { scopeFromUserId } from "@agent-memories/shared"
import { MemorySearchArgsSchema } from "../../schemas/memory.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import type { MemoryService } from "@agent-memories/shared"
import { MemoryServiceError } from "@agent-memories/shared"

export function makeSearchHandler(
  config: Config,
  service: MemoryService,
): ToolHandler {
  return {
    name: "memory.search",
    description:
      "BM25 search across memories within scope. Returns snippet + id + score per hit; total bytes ≤ max_tokens. Fetch full body via memory.get.",
    inputSchema: sanitizeSchema(z.toJSONSchema(MemorySearchArgsSchema)),
    async handle(args: unknown) {
      const parsed = MemorySearchArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client", parsed.project_id);
      try {
        return await service.search(ctx, {
          query: parsed.query,
          max_tokens: parsed.max_tokens,
          strict_scope: parsed.strict_scope,
          explain: parsed.explain,
          include_health: parsed.include_health,
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
