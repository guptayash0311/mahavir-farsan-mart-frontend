export function parseApiError(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return fallback;
  }
  const error = (data as { error?: { message?: unknown } }).error;
  if (error && typeof error.message === "string" && error.message) {
    return error.message;
  }
  return fallback;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
