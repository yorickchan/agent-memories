// DTO types and conversion functions — re-exported from @agent-memories/shared.
// Phase 12: All DTO logic lives in the shared package; MCP proxy imports from there.

export type {
  MemoryDto,
  KgNodeDto,
  KgEdgeDto,
  WorkingMemoryDto,
  ProvenanceEnvelope,
} from "@agent-memories/shared";

export {
  memoryRowToDto,
  kgNodeRowToDto,
  kgEdgeRowToDto,
} from "@agent-memories/shared";
