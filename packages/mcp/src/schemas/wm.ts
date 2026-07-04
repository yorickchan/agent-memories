import { z } from "zod";

export const WmPutArgsSchema = z.object({
  session_id: z.string().min(1).max(256).trim(),
  key: z.string().min(1).max(256).trim(),
  value: z.string().min(1).max(64_000),
  ttl_seconds: z.number().int().min(1).optional(),
  if_match: z.string().min(1),
}).strict();
export type WmPutArgs = z.infer<typeof WmPutArgsSchema>;

export const WmGetArgsSchema = z.object({
  session_id: z.string().min(1).max(256).trim(),
  key: z.string().min(1).max(256).trim(),
}).strict();
export type WmGetArgs = z.infer<typeof WmGetArgsSchema>;

export const WmListArgsSchema = z.object({
  session_id: z.string().min(1).max(256).trim(),
}).strict();
export type WmListArgs = z.infer<typeof WmListArgsSchema>;

export const WmDeleteArgsSchema = z.object({
  session_id: z.string().min(1).max(256).trim(),
  key: z.string().min(1).max(256).trim(),
}).strict();
export type WmDeleteArgs = z.infer<typeof WmDeleteArgsSchema>;

export const WmEntrySchema = z.object({
  key: z.string(),
  etag: z.string(),
  size_tokens: z.number().int().min(0),
  ttl_at: z.string().nullable(),
}).strict();
export type WmEntry = z.infer<typeof WmEntrySchema>;

export const WmPutResponseSchema = z.object({
  key: z.string(),
  etag: z.string(),
  size_tokens: z.number().int().min(0),
}).strict();
export type WmPutResponse = z.infer<typeof WmPutResponseSchema>;

export const WmGetResponseSchema = z.object({
  key: z.string(),
  value: z.string(),
  etag: z.string(),
  size_tokens: z.number().int().min(0),
  ttl_at: z.string().nullable(),
}).strict();
export type WmGetResponse = z.infer<typeof WmGetResponseSchema>;

export const WmListResponseSchema = z.object({
  entries: z.array(WmEntrySchema),
  total_tokens: z.number().int().min(0),
  budget_tokens: z.number().int().min(0),
}).strict();
export type WmListResponse = z.infer<typeof WmListResponseSchema>;

export const WmDeleteResponseSchema = z.object({
  key: z.string(),
  deleted: z.literal(true),
}).strict();
export type WmDeleteResponse = z.infer<typeof WmDeleteResponseSchema>;