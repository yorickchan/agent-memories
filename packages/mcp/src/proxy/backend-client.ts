import type { Config } from "@agent-memories/shared"

export function httpStatusToMcpCode(status: number): number {
  if (status === 404) return -32602;   // NOT_FOUND
  if (status === 409) return -32000;   // CONFLICT/PRECONDITION
  if (status === 401) return -32001;   // UNAUTHORIZED
  return -32603;                        // INTERNAL
}

interface ErrorEnvelope {
  error: { code: number; message: string };
}

function isErrorEnvelope(v: unknown): v is ErrorEnvelope {
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

export class BackendClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: Config) {
    this.baseUrl = `http://127.0.0.1:${config.server.port}`;
    this.headers = {
      "Authorization": `Bearer ${config.server.api_key}`,
      "Content-Type": "application/json",
    };
  }

  async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;
    const opts: RequestInit = { method, headers: this.headers };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const json: unknown = await res.json();

    if (!res.ok) {
      if (isErrorEnvelope(json)) {
        return json; // caller will throw with the error details
      }
      const mcpCode = httpStatusToMcpCode(res.status);
      return { error: { code: mcpCode, message: `HTTP ${res.status}` } };
    }
    return json;
  }
}
