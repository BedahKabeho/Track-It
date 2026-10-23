import { apiRequest } from "./client";
import { API_ENDPOINTS } from "./config";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string | number;
  email: string;
  name?: string;
}

/** The API may return the signed-in user or set an HttpOnly session cookie. */
export interface AuthResponse {
  user?: AuthUser;
  [key: string]: unknown;
}

export const authApi = {
  login: (input: LoginInput) =>
    apiRequest<AuthResponse>(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify({ username: input.email, password: input.password }),
    }),

  register: (input: RegisterInput) =>
    apiRequest<AuthResponse>(API_ENDPOINTS.auth.register, {
      method: "POST",
      body: JSON.stringify({ username: input.email, email: input.email, full_name: input.name, password: input.password }),
    }),

  logout: () =>
    apiRequest<void>(API_ENDPOINTS.auth.logout, { method: "POST" }),

  currentUser: () => apiRequest<AuthUser>(API_ENDPOINTS.auth.currentUser),

  requestPasswordReset: (email: string) =>
    apiRequest<{ detail?: string; message?: string }>(API_ENDPOINTS.auth.passwordReset, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  googleLogin: () =>
    apiRequest<{ authorization_url: string }>(API_ENDPOINTS.auth.google, { method: "GET" }),
};
