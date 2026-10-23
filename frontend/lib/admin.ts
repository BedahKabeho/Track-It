export type AdminRole = "admin" | "user";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  task_count: number;
  last_login: string | null;
}

export interface AdminStats {
  total_users: number;
  pending: number;
  in_progress: number;
  done: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

let mockUsers: AdminUser[] = [
  {
    id: 1,
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "admin",
    is_active: true,
    task_count: 8,
    last_login: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Sam Rivera",
    email: "sam@example.com",
    role: "user",
    is_active: true,
    task_count: 5,
    last_login: "2026-10-22T09:00:00Z",
  },
  {
    id: 3,
    name: "Priya Nair",
    email: "priya@example.com",
    role: "user",
    is_active: true,
    task_count: 3,
    last_login: "2026-10-20T14:30:00Z",
  },
  {
    id: 4,
    name: "Lea Fontaine",
    email: "lea@example.com",
    role: "user",
    is_active: false,
    task_count: 2,
    last_login: "2026-10-01T10:00:00Z",
  },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Admin request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (USE_MOCK) {
    return {
      total_users: mockUsers.length,
      pending: 6,
      in_progress: 4,
      done: 8,
    };
  }
  return request<AdminStats>("/admin/stats/");
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (USE_MOCK) return [...mockUsers];
  return request<AdminUser[]>("/admin/users/");
}

export async function setUserActive(
  id: number,
  is_active: boolean,
): Promise<AdminUser> {
  if (USE_MOCK) {
    const user = mockUsers.find((candidate) => candidate.id === id);
    if (!user) throw new Error("User not found");
    user.is_active = is_active;
    return { ...user };
  }

  return request<AdminUser>(`/admin/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ is_active }),
  });
}
