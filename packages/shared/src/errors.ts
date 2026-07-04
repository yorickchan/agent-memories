// Service error classes extracted to shared package.
// Sources: src/services/memory/errors.ts, src/services/kg/errors.ts, src/services/wm/errors.ts

export const ERR_NOT_FOUND_IN_SCOPE = -32602 as const;
export const ERR_PRECONDITION_FAILED = -32000 as const;
export const ERR_INVALID_CURSOR = -32602 as const;
export const ERR_INTERNAL = -32603 as const;

export class MemoryServiceError extends Error {
  readonly code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = "MemoryServiceError";
    this.code = code;
  }
}

export class KgServiceError extends Error {
  readonly code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = "KgServiceError";
    this.code = code;
  }
}

export class WmServiceError extends Error {
  readonly code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = "WmServiceError";
    this.code = code;
  }
}
