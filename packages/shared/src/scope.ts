// ScopeContext extracted to shared package.
// Source: src/storage/scope.ts

import type { Config } from "./types.js";

export type ScopeContext = {
  readonly user_id: string;
  readonly project_id?: string;
};

export function scopeFromConfigAndArg(
  config: Config,
  projectId?: string,
): ScopeContext {
  return projectId !== undefined && projectId.length > 0
    ? { user_id: config.user_id, project_id: projectId }
    : { user_id: config.user_id };
}
