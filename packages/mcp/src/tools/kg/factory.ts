/**
 * Factory: build the four `kg.*` MCP tool handlers (Phase 4 Plan 04).
 *
 * Plan 04 wires the returned array into `ToolRegistry` during CLI boot.
 * This module only assembles handlers — no registration side-effects here.
 */
import type { Config } from "@agent-memories/shared"
import type { KgService } from "@agent-memories/shared"
import type { ToolHandler } from "../../router.js";
import { makeUpsertNodeHandler } from "./upsert_node.js";
import { makeUpsertEdgeHandler } from "./upsert_edge.js";
import { makeNeighborhoodHandler } from "./neighborhood.js";
import { makeGraphHandler } from "./graph.js";
import { makeGetNodeHandler } from "./get_node.js";

export function createKgTools(
  config: Config,
  service: KgService,
): ToolHandler[] {
  return [
    makeUpsertNodeHandler(config, service),
    makeUpsertEdgeHandler(config, service),
    makeGraphHandler(config, service),
    makeNeighborhoodHandler(config, service),
    makeGetNodeHandler(config, service),
  ];
}
