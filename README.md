# WeDoSoftware — Gym Workout Tracker

A full-stack application for logging gym workouts and tracking progress over time: login/registration,
workout logging with an automatically computed intensity score, a calendar-based workout finder, and
weekly statistics for any selected month.

Built for the WeDoSoftware take-home task. Requirements were intentionally open-ended on tech
choices; the stack below was chosen with a focus on best practices, SOLID principles, and
maintainability/extensibility (see [`Design notes`](#design-notes) for the reasoning behind each
choice).

## Tech stack

| Layer | Choice |
|---|---|
| Backend | .NET 10, ASP.NET Core Web API, Clean Architecture (4 layers) |
| Database | PostgreSQL 17, EF Core 10 (code-first, migrations) |
| Auth | ASP.NET Core Identity + JWT access tokens + rotating refresh tokens (httpOnly cookie) |
| Validation | FluentValidation |
| Frontend | Angular 21 (standalone components, signals, zoneless), Reactive Forms |
| i18n | ngx-translate (English default, Serbian) |
| Email | SMTP (Gmail-compatible) for password-reset links |
| Containerization | Docker Compose (Postgres + API + Angular/nginx) |
| Testing | xUnit (backend, 57 tests), Vitest (frontend) |

## Quick start (Docker — recommended)

This is the fastest way to get the whole stack running with a seeded database.

**Prerequisites:** Docker Desktop.

```bash
git clone <this-repo>
cd WeDoSoftware_task
docker compose up -d --build
```

That's it. On first run this will:
1. Start PostgreSQL (with a health check so nothing else starts before it's ready).
2. Build and start the API — it applies EF Core migrations and seeds demo data automatically on startup.
3. Build the Angular app and serve it via nginx.

Once it's up (~10–20s on first build):

| What | URL |
|---|---|
| App | http://localhost:4200 |
| API / Swagger | http://localhost:8080/swagger |
| PostgreSQL | `localhost:5432` (connect with DBeaver or any client) |

### Demo credentials

Two seeded users, each with several months of workout history (useful for exercising the calendar
and statistics views):

| Username | Password |
|---|---|
| `demo` | `Demo123!` |
| `ana` | `Ana12345!` |

### Stopping / resetting

```bash
docker compose down          # stop containers, keep the database
docker compose down -v       # stop containers AND wipe the database (next `up` reseeds from scratch)
```

> **Note:** PostgreSQL only applies `POSTGRES_PASSWORD` the *first* time its data volume is created.
> If you change the password in `.env` after the volume already exists, run `docker compose down -v`
> so the database is recreated with the new credentials.

## Optional configuration (`.env`)

Copy `.env.example` to `.env` to override defaults (database credentials, frontend base URL, SMTP).
`.env` is git-ignored — never commit real secrets.

### Real password-reset emails (optional)

Without any SMTP configuration, "forgot password" still works end-to-end — the reset link is written
to the API's console log instead of being emailed, so the flow is fully testable out of the box.

To send real emails via Gmail:
1. On the Google account that will send the emails: **Google Account → Security → 2-Step
   Verification** (must be turned on) **→ App passwords** → generate a 16-character app password for
   "Mail".
2. In `.env`:
   ```
   SMTP_USERNAME=your_address@gmail.com
   SMTP_PASSWORD=<the 16-character app password, not your real Gmail password>
   SMTP_FROM_ADDRESS=your_address@gmail.com
   ```
3. `docker compose up -d` — the API picks up the new environment on the next start.

## Architecture

### Backend — Clean Architecture

```
backend/
├─ WeDoSoftware.slnx
├─ src/
│  ├─ WeDoSoftware.Domain          # Entities, enums, pure domain services — zero dependencies
│  ├─ WeDoSoftware.Application     # DTOs, validators, service interfaces (use-case contracts)
│  ├─ WeDoSoftware.Infrastructure  # EF Core, Identity, JWT, email, service implementations
│  └─ WeDoSoftware.Api             # Controllers, DI wiring, middleware, Swagger
└─ tests/
   └─ WeDoSoftware.Tests           # xUnit — mostly domain-logic unit tests
```

Dependency rule: `Api → Application → Domain`, `Infrastructure → Application/Domain`. The Domain
layer has no reference to EF Core, ASP.NET, or any framework — it's plain C#, which is what makes it
so easy to unit-test exhaustively (intensity formula, BMI, age/date rules, weekly-statistics bucketing
all live there).

**Where the interesting logic lives** (all in `WeDoSoftware.Domain.Services`, all unit-tested):
- `IntensityCalculator` — the workout intensity formula (base points per type + duration modifier +
  gender modifier, clamped to 1–10). Computed server-side only; the client only *previews* it.
- `BmiCalculator` — BMI + WHO category thresholds.
- `AgeCalculator` — turns an entered age into a stored date of birth, and enforces "no workout logged
  before the user turned 8".
- `WeeklyStatisticsCalculator` — buckets a month's workouts into Monday–Sunday weeks, clipped to the
  month's actual start/end (so the first and last week can be shorter than 7 days).
- `WorkoutRules` — the "not in the future" / "not before minimum age" checks.

### Frontend — Angular (standalone, signals, zoneless)

```
frontend/src/app/
├─ core/           # AuthService, HTTP interceptors (JWT + auto-refresh + errors), guards,
│                  # Theme/Language/Toast/Confirm services, domain helpers (client-side intensity
│                  # preview, date formatting), models
├─ shared/         # Reusable UI: Modal, Toaster, ConfirmDialog, WheelPicker, ToggleSwitch,
│                  # InfoTooltip, WorkoutCard, LanguageSwitcher, ThemeToggle, PasswordRules
├─ layout/         # Header, HamburgerMenu, MainLayout (the authenticated shell)
├─ features/       # auth, home, workout (add/detail), calendar, statistics, profile
└─ assets/i18n/    # en.json, sr.json — no hardcoded UI text anywhere in the app
```

- **State**: Angular signals + injectable services — no NgRx (the app's state surface didn't
  justify the overhead).
- **Auth**: access token kept in memory only (never localStorage); refresh token is an httpOnly,
  rotating cookie. A functional interceptor attaches the bearer token and transparently retries once
  on a 401 by refreshing.
- **Theming**: CSS custom properties only (`frontend/src/styles.css`) for light/dark — no inline
  styles and no hardcoded colors anywhere in component stylesheets.
- **i18n**: `@ngx-translate`, English (default) and Serbian, switchable at runtime from the header or
  the profile page; the choice is persisted both locally and on the user's account.

## Database & migrations

Schema is entirely managed through EF Core migrations (`backend/src/WeDoSoftware.Infrastructure/Persistence/Migrations`).
The API applies any pending migrations automatically on startup — nothing manual is required for the
Docker flow above.

To add a new migration during development (from the `backend` folder, with a local Postgres or the
Docker one running):
```bash
dotnet ef migrations add <Name> \
  --project src/WeDoSoftware.Infrastructure \
  --startup-project src/WeDoSoftware.Api \
  --output-dir Persistence/Migrations
```

Demo/seed data (`DbSeeder`) runs once, right after migrations, only if the `Users` table is empty —
safe to leave enabled; it won't duplicate data on subsequent restarts.

## Running without Docker (local development)

**Backend** (needs a local PostgreSQL reachable via the connection string in
`backend/src/WeDoSoftware.Api/appsettings.json`, or point it at the Dockerized one — start just
`docker compose up -d db` — and use its exposed `localhost:5432`):
```bash
cd backend
dotnet run --project src/WeDoSoftware.Api
```
Swagger: http://localhost:8080/swagger

**Frontend:**
```bash
cd frontend
npm install
npm start
```
App: http://localhost:4200 (proxies API calls directly to `http://localhost:8080`, so the backend
must already be running).

## Testing

**Backend** (57 unit tests — domain logic: intensity/BMI/age/statistics formulas and their edge
cases):
```bash
cd backend
dotnet test
```

**Frontend:**
```bash
cd frontend
npm test
```

## API client

Swagger (http://localhost:8080/swagger) covers the whole API surface (auth, workouts, statistics,
profile) interactively — try any endpoint directly from there.

## Demo walkthrough

[`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) is a step-by-step shot-list for the short demo video requested by
the task — follow it while screen-recording to cover every feature area in a coherent order.

## Design notes

A few decisions worth calling out (full reasoning in commit history / PR descriptions per milestone):

- **Height/weight** are always stored in metric (cm/kg); the UI's cm↔in / kg↔lb toggle only affects
  display and input, converting back to metric before it reaches the API.
- **Date of birth**, not a raw age number, is what's persisted — entered as an age (8–100) at
  registration, stored as 1 January of the corresponding year. This keeps age always correct over
  time and is what powers the "no workout before you turned 8" rule.
- **Weeks start on Monday** everywhere (calendar and statistics), consistent with ISO-8601 / the
  regional convention, rather than the Sunday-first wireframe.
- **Intensity is never client-authoritative** — the value shown while filling in the Add Workout form
  is a live *preview* computed the same way client-side, but the server always recomputes and stores
  its own value on save.
- **No native `alert`/`confirm`** anywhere — a toast service and a promise-based confirm dialog cover
  every case the mockups used a browser dialog for (discard/save workout, etc).

## Project status

All planned milestones are complete: backend (auth, workouts, statistics), and the full frontend
(login/register/reset, home, add workout, calendar, workout detail, profile, statistics). See git
history for the milestone-by-milestone build order.
