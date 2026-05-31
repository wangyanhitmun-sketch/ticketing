export interface HealthResponse {
  success: boolean;
  data: {
    service: 'ticketing-api';
    status: 'ok';
    timestamp: string;
  } | null;
  error: null | { code: string; message: string };
  requestId: string;
}

export async function fetchHealth(baseUrl = '/api'): Promise<HealthResponse> {
  const response = await fetch(`${baseUrl}/health`);
  return response.json() as Promise<HealthResponse>;
}
