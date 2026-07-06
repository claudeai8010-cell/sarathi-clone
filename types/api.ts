// ============================================================
// API Response Envelope
// Every endpoint returns ApiResponse<T>. No exceptions.
// Client-safe — no server-only imports.
// ============================================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  requestId: string;
  timestamp: string;
}
