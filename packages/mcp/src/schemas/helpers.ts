/**
 * Strip fields `z.toJSONSchema()` adds that are NOT part of the MCP spec's
 * `inputSchema` shape. The MCP 2024-11-05 spec defines `inputSchema` as:
 *   { type: "object", properties?: Record<string, object>, required?: string[] }
 *
 * Zod's `.strict()` schemas produce `"$schema"` and `"additionalProperties":
 * false` — both valid JSON Schema but rejected by strict MCP clients that
 * parse the `ListToolsResult` shape without a `$catchall` for unknown keys.
 */

export function sanitizeSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const { $schema, additionalProperties, ...rest } = schema;
  return rest;
}