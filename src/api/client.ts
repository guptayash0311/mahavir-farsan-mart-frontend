export type HealthResponse = {
  status: string;
  database: string;
  version: string;
};

const rawBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const apiBaseUrl = rawBase.replace(/\/$/, "");

export function parseHealth(data: unknown): HealthResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid health response");
  }
  const body = data as Record<string, unknown>;
  if (
    typeof body.status !== "string" ||
    typeof body.database !== "string" ||
    typeof body.version !== "string"
  ) {
    throw new Error("Invalid health response");
  }
  return {
    status: body.status,
    database: body.database,
    version: body.version,
  };
}

export async function getHealth(): Promise<HealthResponse> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/v1/health`);
  } catch {
    throw new Error("Unable to reach the API");
  }
  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }
  return parseHealth(await response.json());
}
