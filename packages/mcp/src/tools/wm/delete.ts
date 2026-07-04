import type { Config } from "@agent-memories/shared"
import type { WmService } from "@agent-memories/shared"
import { WmServiceError } from "@agent-memories/shared"
import { WmDeleteArgsSchema } from "../../schemas/wm.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import { scopeFromConfigAndArg } from "@agent-memories/shared"
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function makeWmDeleteHandler(config: Config, service: WmService) {
  return {
    name: "wm.delete",
    description: "Soft-delete a working memory entry by session+key. Idempotent — calling twice succeeds both times.",
    inputSchema: sanitizeSchema(z.toJSONSchema(WmDeleteArgsSchema)),
    async handle(args: unknown) {
      const parsed = WmDeleteArgsSchema.parse(args);
      const ctx = scopeFromConfigAndArg(config);
      try { return service.delete(ctx, parsed.session_id, parsed.key); }
      catch (err) { if (err instanceof WmServiceError) throw new McpError(err.code, err.message); throw err; }
    },
  };
}