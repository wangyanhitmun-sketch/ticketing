export interface RequestContext {
  userId: string;
  teamIds: string[];
  roles: string[];
  requestId: string;
  idempotencyKey?: string;
}

export function createAnonymousRequestContext(requestId = 'local'): RequestContext {
  return {
    userId: 'anonymous',
    teamIds: [],
    roles: [],
    requestId,
  };
}
