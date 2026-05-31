export interface ApiConfig {
  nodeEnv: string;
  port: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const rawPort = env.API_PORT ?? '3001';
  const port = Number.parseInt(rawPort, 10);

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid API_PORT: ${rawPort}`);
  }

  return {
    nodeEnv: env.NODE_ENV ?? 'development',
    port,
  };
}
