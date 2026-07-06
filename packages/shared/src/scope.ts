// ScopeContext extracted to shared package.
// Source: src/storage/scope.ts

export type ScopeContext = {
  readonly user_id: string;
  readonly project_id?: string;
};

export function scopeFromUserId(
  userId: string,
  projectId?: string,
): ScopeContext {
  return projectId !== undefined && projectId.length > 0
    ? { user_id: userId, project_id: projectId }
    : { user_id: userId };
}