import type { Config } from "@agent-memories/shared"
import type { ScopeContext } from "@agent-memories/shared"
import { BackendClient } from "./backend-client.js";
import { WmServiceError } from "@agent-memories/shared"

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
    throw new WmServiceError(res.error.code, res.error.message);
  }
}

export class HttpWmService {
  private client: BackendClient;

  constructor(config: Config) {
    this.client = new BackendClient(config);
  }

  async put(
    ctx: ScopeContext,
    sessionId: string,
    key: string,
    value: string,
    ifMatch: string,
    ttlSeconds?: number,
  ) {
    const qs = ctx.project_id ? `?project_id=${ctx.project_id}` : "";
    const body: Record<string, unknown> = { value, if_match: ifMatch };
    if (ttlSeconds !== undefined) body.ttl_seconds = ttlSeconds;
    const res = await this.client.request("PUT", `/api/wm/${sessionId}/${key}${qs}`, body);
    checkError(res);
    return res;
  }

  async get(ctx: ScopeContext, sessionId: string, key: string) {
    const qs = ctx.project_id ? `?project_id=${ctx.project_id}` : "";
    const res = await this.client.request("GET", `/api/wm/${sessionId}/${key}${qs}`);
    checkError(res);
    return res;
  }

  async list(ctx: ScopeContext, sessionId: string) {
    const qs = ctx.project_id ? `?project_id=${ctx.project_id}` : "";
    return this.client.request("GET", `/api/wm/${sessionId}${qs ? `?${qs}` : ""}`);
  }

  async delete(ctx: ScopeContext, sessionId: string, key: string) {
    const qs = ctx.project_id ? `?project_id=${ctx.project_id}` : "";
    return this.client.request("DELETE", `/api/wm/${sessionId}/${key}${qs}`);
  }
}
