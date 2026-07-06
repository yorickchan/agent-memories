export type { Config, ServerConfig } from "./types.js";
export type { ScopeContext } from "./scope.js";
export { scopeFromUserId } from "./scope.js";
export {
  MemoryServiceError,
  KgServiceError,
  WmServiceError,
  ERR_NOT_FOUND_IN_SCOPE,
  ERR_PRECONDITION_FAILED,
  ERR_INVALID_CURSOR,
  ERR_INTERNAL,
} from "./errors.js";
export type { MemoryRow, MemorySearchRow, MemoryListRow, KgNodeRow, KgEdgeRow, WorkingMemoryRow } from "./rows.js";
export { countTokens, MEMORY_HIT_ENVELOPE_TOKENS, MAX_TOKENS_MIN, MAX_TOKENS_MAX, MAX_TOKENS_DEFAULT } from "./tokens.js";
export type { MemoryService, KgService, WmService } from "./interfaces.js";
export type { MemoryDto, KgNodeDto, KgEdgeDto, WorkingMemoryDto, ProvenanceEnvelope } from "./dto.js";
export { memoryRowToDto, kgNodeRowToDto, kgEdgeRowToDto, workingMemoryRowToDto } from "./dto.js";

export type KgNeighborhoodEdge = {
  id?: string;
  subject_id?: string;
  predicate: string;
  object_id?: string;
  direction: "out" | "in";
  node?: { id: string; type: string; name: string; props: unknown };
  props?: unknown;
};

export type KgNeighborhoodMeta = {
  depth: number;
  node_count?: number;
  edge_count?: number;
  truncated?: boolean;
  total_edges_discovered?: number;
};

export type KgNeighborhoodResponse = {
  node: {
    id: string;
    type: string;
    name: string;
    props: unknown;
  };
  edges: KgNeighborhoodEdge[];
  meta: KgNeighborhoodMeta;
};
