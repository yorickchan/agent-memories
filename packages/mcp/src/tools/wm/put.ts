import type { Config } from "@agent-memories/shared"
import type { WmService } from "@agent-memories/shared"
import { WmServiceError } from "@agent-memories/shared"
import { WmPutArgsSchema } from "../../schemas/wm.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import { scopeFromUserId } from "@agent-memories/shared"
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function makeWmPutHandler(config: Config, service: WmService) {
  return {
    name: "wm.put",
    description: "Write a value to the working memory scratchpad. if_match (ETag) is mandatory — missing or stale causes -32000 Precondition failed.",
    inputSchema: sanitizeSchema(z.toJSONSchema(WmPutArgsSchema)),
    async handle(args: unknown) {
      const parsed = WmPutArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client");
      try {
        return service.put(ctx, parsed.session_id, parsed.key, parsed.value, parsed.if_match, parsed.ttl_seconds);
      } catch (err) {
        if (err instanceof WmServiceError) throw new McpError(err.code, err.message);
        throw err;
      }
    },
  };
}