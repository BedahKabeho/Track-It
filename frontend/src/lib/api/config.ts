/**
 * Keep the backend origin and route contract in one place. Update these paths
 * once the backend team publishes its final URL structure.
 */
const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredBaseUrl || "http://localhost:8001/api").replace(/\/+$/, "");

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login/",
    register: "/auth/register/",
    logout: "/auth/logout/",
    currentUser: "/auth/me/",
    passwordReset: "/auth/password-reset/",
    google: "/auth/google/",
  },
  tasks: {
    list: "/tasks/",
    detail: (taskId: string | number) => `/tasks/${encodeURIComponent(taskId)}/`,
  },
} as const;
