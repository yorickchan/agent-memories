import type { Config } from "@agent-memories/shared"
import type { WmService } from "@agent-memories/shared"
import { WmServiceError } from "@agent-memories/shared"
import { WmGetArgsSchema } from "../../schemas/wm.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import { scopeFromConfigAndArg } from "@agent-memories/shared"
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function makeWmGetHandler(config: Config, service: WmService) {
  return {
    name: "wm.get",
    description: "Read a value from the working memory scratchpad by session+key. Expired entries return -32602.",
    inputSchema: sanitizeSchema(z.toJSONSchema(WmGetArgsSchema)),
    async handle(args: unknown) {
      const parsed = WmGetArgsSchema.parse(args);
      const ctx = scopeFromConfigAndArg(config);
      try {
        return service.get(ctx, parsed.session_id, parsed.key);
      } catch (err) {
        if (err instanceof WmServiceError) throw new McpError(err.code, err.message);
        throw err;
      }
    },
  };
}