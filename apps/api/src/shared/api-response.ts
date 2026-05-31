export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: null | {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId: string;
}

export function ok<T>(data: T, requestId = 'local'): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    requestId,
  };
}
