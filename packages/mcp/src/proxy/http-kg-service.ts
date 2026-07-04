import type { Config } from "@agent-memories/shared"
import type { ScopeContext } from "@agent-memories/shared"
import { BackendClient } from "./backend-client.js";
import { KgServiceError } from "@agent-memories/shared"

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
    throw new KgServiceError(res.error.code, res.error.message);
  }
}

export class HttpKgService {
  private client: BackendClient;

  constructor(config: Config) {
    this.client = new BackendClient(config);
  }

  async upsertNode(ctx: ScopeContext, args: Record<string, unknown>) {
    const body = { ...args, project_id: ctx.project_id ?? undefined };
    const res = await this.client.request("POST", "/api/kg/nodes", body);
    checkError(res);
    return res;
  }

  async upsertEdge(ctx: ScopeContext, args: Record<string, unknown>) {
    const body = { ...args, project_id: ctx.project_id ?? undefined };
    const res = await this.client.request("POST", "/api/kg/edges", body);
    checkError(res);
    return res;
  }

  async getNode(ctx: ScopeContext, id: string) {
    const qs = ctx.project_id ? `?project_id=${ctx.project_id}` : "";
    const res = await this.client.request("GET", `/api/kg/nodes/${id}${qs}`);
    checkError(res);
    return res;
  }

  async neighborhood(ctx: ScopeContext, args: Record<string, unknown>) {
    const params = new URLSearchParams();
    if (ctx.project_id) params.set("project_id", ctx.project_id);
    if (args.strict_scope) params.set("strict_scope", "true");
    if (args.max_tokens) params.set("max_tokens", String(args.max_tokens));
    const qs = params.toString();
    const path = `/api/kg/nodes/${args.node_id}/neighborhood${qs ? `?${qs}` : ""}`;
    return this.client.request("GET", path);
  }

  async graph(ctx: ScopeContext, args: { format?: "mermaid" | "json" }) {
    const params = new URLSearchParams();
    if (ctx.project_id) params.set("project_id", ctx.project_id);
    if (args.format) params.set("format", args.format);
    const qs = params.toString();
    return this.client.request("GET", `/api/kg/graph${qs ? `?${qs}` : ""}`);
  }
}
