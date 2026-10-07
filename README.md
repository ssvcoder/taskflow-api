# TaskFlow API

A full-stack task management app: organize work into **projects**, track **tasks** with
status, priority, and due dates, all behind JWT authentication. Built to show an
end-to-end slice of modern .NET + React development, containerized with Docker.

## Tech stack

| Layer    | Technology |
|----------|------------|
| Backend  | ASP.NET Core 8 Web API, Entity Framework Core 8 |
| Database | PostgreSQL 16 (Npgsql provider) |
| Auth     | JWT bearer tokens, BCrypt password hashing |
| Frontend | React 18 + Vite, plain CSS (no UI framework) |
| Docs     | Swagger / OpenAPI (dev only) |
| DevOps   | Docker, docker-compose (API + frontend + PostgreSQL) |

## Architecture

```
┌──────────────┐      HTTP /api/*       ┌──────────────────┐      EF Core      ┌────────────┐
│  React SPA   │  ───────────────────▶  │  ASP.NET Core 8  │  ──────────────▶  │ PostgreSQL │
│  (nginx)     │  ◀───────────────────  │  Web API         │  ◀──────────────  │     16     │
└──────────────┘      JSON + JWT        └──────────────────┘                   └────────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │ Controllers → Services  │
                                    │ → EF Core → PostgreSQL  │
                                    └─────────────────────────┘
```

- **Controllers** (`Controllers/`) — thin HTTP layer: routing, auth attributes, status codes.
- **Services** (`Services/`) — business logic and per-user data scoping (users can only
  see their own projects and tasks).
- **Models** (`Models/`) — EF Core entities: `User`, `Project`, `TaskItem`.
- **DTOs** (`DTOs/`) — request/response shapes with data-annotation validation, so
  entity internals (like password hashes) never leak over the wire.
- **Data** (`Data/`) — `AppDbContext` plus `DbSeeder`, which creates a demo account
  on first run.

The React frontend talks to the API through relative `/api/*` URLs — in development
Vite proxies them to the backend, and in Docker nginx does the same, so no
environment-specific API URL is needed.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the quick start), **or**
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0), [Node.js 20+](https://nodejs.org/), and PostgreSQL 16 (for local development)

## Quick start (Docker)

```bash
docker compose up --build
```

Then open:

- App: http://localhost:3000
- API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger *(see note below)*

> Swagger UI is only enabled in the Development environment. The docker-compose
> setup runs the API in Production, so use local development (below) for Swagger,
> or set `ASPNETCORE_ENVIRONMENT=Development` in the compose file.

**Demo login** (seeded automatically on first run):

- Email: `demo@taskflow.dev`
- Password: `demo1234`

## Local development

**Backend:**

```bash
cd backend/TaskFlow.Api
# appsettings.json points at localhost:5432 by default — adjust if needed
dotnet run
# API on http://localhost:5000, Swagger on http://localhost:5000/swagger
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
# App on http://localhost:5173 (API calls proxied to localhost:5000)
```

## API endpoints

All endpoints except the auth ones require a `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user → returns JWT |
| POST | `/api/auth/login` | Log in → returns JWT |
| GET | `/api/projects` | List my projects (with task counts) |
| GET | `/api/projects/{id}` | Project detail incl. its tasks |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/{id}` | Update a project |
| DELETE | `/api/projects/{id}` | Delete a project (and its tasks) |
| GET | `/api/projects/{projectId}/tasks` | List tasks in a project |
| POST | `/api/projects/{projectId}/tasks` | Create a task in a project |
| GET | `/api/tasks/{id}` | Get a single task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

Task payloads use `status` (`Todo` / `InProgress` / `Done`) and `priority`
(`Low` / `Medium` / `High`).

### Example

```bash
# Log in
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@taskflow.dev","password":"demo1234"}'

# Create a project (replace TOKEN)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Website Redesign","description":"Q1 homepage overhaul"}'
```

## Screenshots

Screenshots live in `docs/screenshots/`:

- `docs/screenshots/login.png` — sign-in page with the demo credentials hint
- `docs/screenshots/dashboard.png` — project sidebar, task list with status/priority badges
- `docs/screenshots/task-form.png` — the create/edit task dialog

*(Placeholders — capture them from a running instance with `docker compose up`.)*

## Notes

- Passwords are hashed with BCrypt; the JWT secret in `appsettings.json` /
  `docker-compose.yml` is a dev value — replace it via environment variables in
  any real deployment.
- Database migrations run automatically on API startup (`db.Database.Migrate()`),
  so a fresh `docker compose up` works with an empty Postgres volume.
