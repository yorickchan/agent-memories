import type { Config } from "@agent-memories/shared"
import type { ScopeContext } from "@agent-memories/shared"
import { BackendClient } from "./backend-client.js";
import { MemoryServiceError } from "@agent-memories/shared"

function isErrorEnvelope(v: unknown): v is { error: { code: number; message: string } } {
  return (
    typeof v === "object" &&
    v !== null &&
    "error" in v &&
    typeof (v as Record<string, unknown>).error === "object" &&
    (v as Record<string, unknown>).error !== null &&
    "code" in ((v as Record<string, unknown>).error as Record<string, unknown>) &&
    "message" in ((v as Record<string, unknown>).error as Record<string, unknown>)
  );
}

function checkError(res: unknown): never | void {
  if (isErrorEnvelope(res)) {
    throw new MemoryServiceError(res.error.code, res.error.message);
  }
}

export class HttpMemoryService {
  private client: BackendClient;

  constructor(config: Config) {
    this.client = new BackendClient(config);
  }

  async write(ctx: ScopeContext, args: Record<string, unknown>) {
    const body = { ...args, project_id: ctx.project_id ?? undefined };
    const res = await this.client.request("POST", "/api/memories", body);
    checkError(res);
    return res;
  }

  async search(ctx: ScopeContext, args: Record<string, unknown>) {
    const body = { ...args, project_id: ctx.project_id ?? undefined };
    const res = await this.client.request("POST", "/api/memories/search", body);
    checkError(res);
    return res;
  }

  async get(ctx: ScopeContext, id: string) {
    const qs = ctx.project_id ? `?project_id=${ctx.project_id}` : "";
    const res = await this.client.request("GET", `/api/memories/${id}${qs}`);
    checkError(res);
    return res;
  }

  async update(ctx: ScopeContext, args: Record<string, unknown>) {
    const qs = ctx.project_id ? `?project_id=${ctx.project_id}` : "";
    const body = {
      content: args.content,
      tags: args.tags,
      if_updated_at: args.if_updated_at,
    };
    const res = await this.client.request("PATCH", `/api/memories/${args.id}${qs}`, body);
    checkError(res);
    return res;
  }

  async delete(ctx: ScopeContext, id: string) {
    const qs = ctx.project_id ? `?project_id=${ctx.project_id}` : "";
    const res = await this.client.request("DELETE", `/api/memories/${id}${qs}`);
    checkError(res);
    return res;
  }

  async list(ctx: ScopeContext, args: Record<string, unknown>) {
    const params = new URLSearchParams();
    if (ctx.project_id) params.set("project_id", ctx.project_id);
    if (args.limit) params.set("limit", String(args.limit));
    if (args.cursor) params.set("cursor", String(args.cursor));
    if (args.include_tombstoned) params.set("include_tombstoned", "true");
    if (args.strict_scope) params.set("strict_scope", "true");
    const qs = params.toString();
    const path = `/api/memories${qs ? `?${qs}` : ""}`;
    return this.client.request("GET", path);
  }
}
