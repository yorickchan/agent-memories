import type { MemoryRow, KgNodeRow, KgEdgeRow } from "./rows.js";

export type ProvenanceEnvelope = {
  id: string;
  user_id: string;
  project_id: string | null;
  source_agent: string;
  session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MemoryDto = {
  content: string;
  tags: string[] | null;
  tombstoned: boolean;
  embedding_status: "pending" | "ready" | "failed";
  embedding_model: string | null;
  embedding_version: string | null;
} & ProvenanceEnvelope;

export type KgNodeDto = {
  type: string;
  name: string;
  props: unknown;
} & ProvenanceEnvelope;

export type KgEdgeDto = {
  subject_id: string;
  predicate: string;
  object_id: string;
  props: unknown;
} & ProvenanceEnvelope;

export type WorkingMemoryDto = {
  key: string;
  value: string;
  etag: string;
} & Omit<ProvenanceEnvelope, "session_id">;

function parseJsonColumn<T>(raw: string | null): T | null {
  if (raw === null) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function memoryRowToDto(row: MemoryRow): MemoryDto {
  return {
    id: row.id, content: row.content,
    tags: parseJsonColumn<string[]>(row.tags),
    tombstoned: row.tombstoned === 1,
    embedding_status: row.embedding_status,
    embedding_model: row.embedding_model,
    embedding_version: row.embedding_version,
    user_id: row.user_id, project_id: row.project_id,
    source_agent: row.source_agent, session_id: row.session_id,
    created_at: row.created_at, updated_at: row.updated_at,
  };
}

export function kgNodeRowToDto(row: KgNodeRow): KgNodeDto {
  return {
    id: row.id, type: row.type, name: row.name,
    props: parseJsonColumn<{ [key: string]: unknown }>(row.props),
    user_id: row.user_id, project_id: row.project_id,
    source_agent: row.source_agent, session_id: row.session_id,
    created_at: row.created_at, updated_at: row.updated_at,
  };
}

export function kgEdgeRowToDto(row: KgEdgeRow): KgEdgeDto {
  return {
    id: row.id, subject_id: row.subject_id,
    predicate: row.predicate, object_id: row.object_id,
    props: parseJsonColumn<{ [key: string]: unknown }>(row.props),
    user_id: row.user_id, project_id: row.project_id,
    source_agent: row.source_agent, session_id: row.session_id,
    created_at: row.created_at, updated_at: row.updated_at,
  };
}

export function workingMemoryRowToDto(row: { user_id: string; project_id: string | null; key: string; value: string; etag: string; created_at: string; updated_at: string }): WorkingMemoryDto {
  return {
    id: row.etag,
    key: row.key,
    value: row.value,
    etag: row.etag,
    user_id: row.user_id,
    project_id: row.project_id,
    source_agent: "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
