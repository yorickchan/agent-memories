import type { Config } from "@agent-memories/shared"
import type { WmService } from "@agent-memories/shared"
import { WmServiceError } from "@agent-memories/shared"
import { WmListArgsSchema } from "../../schemas/wm.js";
import { sanitizeSchema } from "../../schemas/helpers.js";
import { scopeFromUserId } from "@agent-memories/shared"
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function makeWmListHandler(config: Config, service: WmService) {
  return {
    name: "wm.list",
    description: "List all active working memory entries for a session, with token budget usage.",
    inputSchema: sanitizeSchema(z.toJSONSchema(WmListArgsSchema)),
    async handle(args: unknown) {
      const parsed = WmListArgsSchema.parse(args);
      const ctx = scopeFromUserId("mcp-client");
      try { return service.list(ctx, parsed.session_id); }
      catch (err) { if (err instanceof WmServiceError) throw new McpError(err.code, err.message); throw err; }
    },
  };
}