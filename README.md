# Track-It

A task tracking project built with Next.js, Django REST Framework, PostgreSQL, and Docker Compose.

## Run locally

Install Docker Desktop, then start the stack from this directory:

```bash
docker compose up --build
```

Open the Docker dashboard at http://localhost:3001, the Django admin at http://localhost:8001/admin/, and the backend health endpoint at http://localhost:8001/api/health/.

The signup form sends `POST /api/auth/register/` with `full_name`, `email`, `password`, and `terms_accepted`. A successful response includes the saved user and an authentication token. Use that token as `Authorization: Token <token>` with `GET /api/auth/me/` to read the authenticated user's saved profile. The frontend proxies `/api/*` requests to Django, so signup works from its own origin.

Compose uses development-only database and Django secret defaults. Set `POSTGRES_PASSWORD` and `DJANGO_SECRET_KEY` in the environment before using the stack outside local development.
# Track It - Simple Task Tracker

Track It is a web-based task management system.

## Technologies
- Frontend: Next.js
- Backend: Django REST Framework
- Database: PostgreSQL
- Containerization: Docker
- Version Control: Git and GitHub

## Features
- User registration and login
- Create and view tasks
- Update task status
- Admin dashboard
- Role-based access control
