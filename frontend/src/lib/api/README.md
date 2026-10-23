# Frontend API integration

The browser calls Django through the shared request client in `client.ts` and the feature services in `auth.ts` and `tasks.ts`. UI components should use these services instead of calling `fetch` directly.

Set `NEXT_PUBLIC_API_BASE_URL` to the backend API root. The local example is `http://localhost:8001/api`; endpoint paths live in `config.ts`, so a different backend route contract can be applied there without changing page components.

The initial route contract is:

| Feature | Method | Path | Request / response |
| --- | --- | --- | --- |
| Sign in | POST | `/auth/login/` | `{ email, password }` → user/session response |
| Register | POST | `/auth/register/` | `{ name, email, password }` → user/session response |
| Sign out | POST | `/auth/logout/` | Ends the current session |
| Current user | GET | `/auth/me/` | → user |
| Password reset | POST | `/auth/password-reset/` | `{ email }` → confirmation |
| Google sign in | GET | `/auth/google/` | → `{ authorization_url }` |
| List/create tasks | GET/POST | `/tasks/` | → task list / created task |
| Read/update/delete task | GET/PATCH/DELETE | `/tasks/{id}/` | → task / updated task / no content |

These paths are a frontend contract placeholder because the Django app does not expose API routes yet. When backend routes are agreed, update `config.ts` and, if needed, the request/response types in the feature service. `client.ts` includes credentials for cookie-based sessions and normalizes JSON/API errors in one place.

For local development, Django must allow the frontend origin (normally `http://localhost:3000`) through CORS. If the API uses Django session authentication, its CORS and CSRF settings must allow credentialed requests from that origin. If the agreed API uses bearer tokens instead, add that authorization handling in the shared client rather than in individual pages.
