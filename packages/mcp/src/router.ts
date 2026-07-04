/**
 * A single registered tool. Phase 1 registers ZERO tools; Phase 2+ appends
 * memory/kg/wm handlers via {@link ToolRegistry.register}.
 *
 * `inputSchema` is opaque here (a JSON Schema object) so the router does not
 * depend on zod at this layer — the DTO/schema boundary (D-19/D-26) lives in
 * `src/protocol/mcp/schemas/` and is owned by PLAN 06.
 */
export interface ToolHandler {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: unknown;
  handle(args: unknown): Promise<unknown>;
}

/** Public listing shape returned by `tools/list` — no `handle` exposed. */
export type ToolListing = {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: unknown;
};

/**
 * In-process tool registry. Empty in Phase 1 (D-30: `_health` optional but
 * not registered). `list()` returns `{ tools: [] }` until Phase 2 verbs land.
 */
export class ToolRegistry {
  private readonly tools = new Map<string, ToolHandler>();

  register(t: ToolHandler): void {
    this.tools.set(t.name, t);
  }

  list(): { tools: ToolListing[] } {
    return {
      tools: [...this.tools.values()].map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),
    };
  }

  get(name: string): ToolHandler | undefined {
    return this.tools.get(name);
  }
}