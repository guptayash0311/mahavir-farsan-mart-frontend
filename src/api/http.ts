import { apiBaseUrl } from "./client";
import { ApiError, parseApiError } from "./errors";

const ACCESS = "mahavir_access";
const REFRESH = "mahavir_refresh";
const GUEST = "mahavir_guest";

function store(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function getGuestToken(): string {
  const existing = store()?.getItem(GUEST);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  store()?.setItem(GUEST, created);
  return created;
}

export function saveSession(access: string, refresh: string): void {
  store()?.setItem(ACCESS, access);
  store()?.setItem(REFRESH, refresh);
}

export function clearSession(): void {
  store()?.removeItem(ACCESS);
  store()?.removeItem(REFRESH);
}

export function hasSession(): boolean {
  return Boolean(store()?.getItem(ACCESS));
}

async function raw(path: string, options: RequestInit, auth: boolean): Promise<Response> {
  const headers = new Headers(options.headers);
  if (auth) {
    const token = store()?.getItem(ACCESS);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("X-Guest-Token")) {
    headers.set("X-Guest-Token", getGuestToken());
  }
  return fetch(`${apiBaseUrl}${path}`, { ...options, headers });
}

async function refreshSession(): Promise<boolean> {
  const token = store()?.getItem(REFRESH);
  if (!token) {
    return false;
  }
  const response = await raw(
    "/api/v1/auth/refresh",
    { method: "POST", body: JSON.stringify({ refresh_token: token }) },
    false,
  );
  if (!response.ok) {
    clearSession();
    return false;
  }
  const body = (await response.json()) as { access_token: string; refresh_token: string };
  saveSession(body.access_token, body.refresh_token);
  return true;
}

export async function api<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const auth = options.auth !== false;
  let response = await raw(path, options, auth);
  if (response.status === 401 && auth && !path.startsWith("/api/v1/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await raw(path, options, true);
    }
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, parseApiError(data, "Request failed"));
  }
  return data as T;
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith("http")) {
    return path;
  }
  return `${apiBaseUrl}${path}`;
}
