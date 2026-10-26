export type Account = {
  id: number;
  full_name: string;
  email: string;
  is_admin?: boolean;
  role?: "ADMIN" | "USER";
  is_superuser?: boolean;
};

export type WorkspaceRecord = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type TaskRecord = {
  id: number;
  workspace: number;
  title: string;
  description: string;
  due_date: string;
  status: "pending" | "in_progress" | "done";
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationRecord = {
  id: number;
  task: number | null;
  notification_type: string;
  message: string;
  scheduled_for: string | null;
  created_at: string;
  read_at: string | null;
};

export const TOKEN_KEY = "trackitz_token";

export function getToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  if (authenticated) {
    const token = getToken();
    if (!token) throw new Error("Please sign in to continue.");
    headers.set("Authorization", `Token ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running and try again.");
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      window.localStorage.removeItem(TOKEN_KEY);
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error(getApiError(payload) || `Request failed (${response.status}).`);
  }

  return payload as T;
}

export function getApiError(payload: unknown) {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "";
  const values = Object.values(payload as Record<string, unknown>);
  for (const value of values) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length) return value.join(" ");
  }
  return "";
}
