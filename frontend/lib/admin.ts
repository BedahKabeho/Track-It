import { apiRequest } from "@/lib/api";

export type AdminStats = {
  total_users: number;
  total_workspaces: number;
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
};

export type AdminTask = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "done";
  due_date: string;
  created_at: string;
  workspace: number;
  workspace_name: string;
  user_name: string;
  user_email: string;
};

export type AdminTaskFilters = {
  search?: string;
  status?: string;
};

export type AdminUser = {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  role: "ADMIN" | "USER";
  is_admin: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  workspace_count: number;
  task_count: number;
};

export function getAdminStats() {
  return apiRequest<AdminStats>("/api/admin/stats/");
}

export function getAdminUsers(search = "") {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  const query = params.toString();
  return apiRequest<AdminUser[]>(`/api/admin/users/${query ? `?${query}` : ""}`);
}

export function setAdminUserRole(userId: number, role: "ADMIN" | "USER") {
  return apiRequest<{
    user: Pick<AdminUser, "id" | "role" | "is_admin" | "is_superuser">;
  }>(`/api/admin/users/${userId}/role/`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function getAdminTasks(filters: AdminTaskFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  const query = params.toString();
  return apiRequest<AdminTask[]>(`/api/admin/tasks/${query ? `?${query}` : ""}`);
}
