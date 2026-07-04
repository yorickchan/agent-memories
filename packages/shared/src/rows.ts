// Row types extracted to shared package. Must match backend storage/rows.ts EXACTLY.

export type MemoryRow = {
  id: string;
  content: string;
  tags: string | null;
  tombstoned: 0 | 1;
  user_id: string;
  project_id: string | null;
  source_agent: string;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  embedding_model: string | null;
  embedding_version: string | null;
  embedding: Buffer | null;
  embedding_status: "pending" | "ready" | "failed";
  embedding_retry_count: number;
};

export type MemorySearchRow = MemoryRow & {
  rank: number;
  snippet: string;
};

export type MemoryListRow = MemoryRow & { scope_rank: number };

export type KgNodeRow = {
  id: string;
  type: string;
  name: string;
  props: string | null;
  user_id: string;
  project_id: string | null;
  source_agent: string;
  session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type KgEdgeRow = {
  id: string;
  subject_id: string;
  predicate: string;
  object_id: string;
  props: string | null;
  user_id: string;
  project_id: string | null;
  source_agent: string;
  session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkingMemoryRow = {
  user_id: string;
  project_id: string | null;
  session_id: string;
  key: string;
  value: string;
  etag: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};
