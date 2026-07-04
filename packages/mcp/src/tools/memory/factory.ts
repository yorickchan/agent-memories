/**
 * Factory: build the six `memory.*` MCP tool handlers (Phase 2 Plan 05).
 *
 * Plan 06 wires the returned array into `ToolRegistry` during CLI boot.
 * This module only assembles handlers — no registration side-effects here.
 */
import type { Config } from "@agent-memories/shared"
import type { MemoryService } from "@agent-memories/shared"
import type { ToolHandler } from "../../router.js";
import { makeWriteHandler } from "./write.js";
import { makeSearchHandler } from "./search.js";
import { makeGetHandler } from "./get.js";
import { makeUpdateHandler } from "./update.js";
import { makeDeleteHandler } from "./delete.js";
import { makeListHandler } from "./list.js";

export function createMemoryTools(
  config: Config,
  service: MemoryService,
): ToolHandler[] {
  return [
    makeWriteHandler(config, service),
    makeSearchHandler(config, service),
    makeGetHandler(config, service),
    makeUpdateHandler(config, service),
    makeDeleteHandler(config, service),
    makeListHandler(config, service),
  ];
}
