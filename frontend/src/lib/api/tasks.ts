import { apiRequest } from "./client";
import { API_ENDPOINTS } from "./config";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

/** Task data access for dashboard and task pages as they are added. */
export const tasksApi = {
  list: () => apiRequest<Task[] | { results: Task[] }>(API_ENDPOINTS.tasks.list),

  get: (taskId: string | number) =>
    apiRequest<Task>(API_ENDPOINTS.tasks.detail(taskId)),

  create: (input: CreateTaskInput) =>
    apiRequest<Task>(API_ENDPOINTS.tasks.list, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (taskId: string | number, input: UpdateTaskInput) =>
    apiRequest<Task>(API_ENDPOINTS.tasks.detail(taskId), {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  remove: (taskId: string | number) =>
    apiRequest<void>(API_ENDPOINTS.tasks.detail(taskId), { method: "DELETE" }),
};
