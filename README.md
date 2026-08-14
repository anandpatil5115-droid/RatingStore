# Store Rating — Full-Stack Application

A production-ready, full-stack store rating platform built with **React**, **Node.js (Express)**, **PostgreSQL** and **Prisma**. Users can register and rate stores, store owners can track how customers rate their store, and system administrators can manage users and stores with full search, filter, sort and pagination support.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Seed Data & Test Credentials](#seed-data--test-credentials)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [API Overview](#api-overview)
- [Validation Rules](#validation-rules)
- [Security](#security)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Deployment](#deployment)

---

## Features

- **Role-based dashboards** for `SYSTEM_ADMIN`, `STORE_OWNER` and `NORMAL_USER` from a single login page.
- **Store discovery** for normal users — search by name/address, view overall rating and your own rating, and submit or modify a 1–5 star rating (one rating per store; re-rating updates in place).
- **Admin dashboard** — total users / stores / ratings, users-by-role and rating-distribution cards.
- **Admin store management** — server-side search (name/email/address), sorting (including by average rating), pagination.
- **Admin user management** — search, role filter, sorting, pagination, and a details modal that shows the store + average rating for store owners.
- **Admin can create** normal users, admins and store owners, and can create stores (assigning an existing store owner).
- **Store owner dashboard** — average rating, total ratings, rating breakdown, and a sortable table of the users who rated their store (owners can only ever see their own store's ratings).
- **Password change** for every role (current + new + confirm).
- **JWT authentication**, `bcrypt` password hashing, role-based authorization middleware, input validation on both frontend and backend, and centralized error handling.

---

## Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 19, React Router 7, Vite, Axios                  |
| Styling    | Custom, responsive CSS (design-system + CSS variables) |
| Backend    | Node.js, Express 4                                     |
| Database   | PostgreSQL                                             |
| ORM        | Prisma 6                                               |
| Auth       | JWT (`jsonwebtoken`) + `bcrypt` password hashing       |
| Validation | `express-validator` (backend) + client-side validators  |

---

## Architecture

```
store-rating/
├── backend/                        # Express REST API
│   ├── prisma/
│   │   ├── schema.prisma           # data model
│   │   ├── migrations/             # SQL migrations (incl. rating CHECK constraint)
│   │   └── seed.js                 # seed script
│   └── src/
│       ├── app.js                  # express app (cors, json, routes, errors)
│       ├── server.js               # bootstrap
│       ├── config/                 # env + prisma client
│       ├── controllers/            # thin HTTP layer
│       ├── services/               # business logic (thick layer)
│       ├── routes/                 # route definitions + RBAC wiring
│       ├── middleware/             # auth, roles, validation, error handling
│       ├── validators/             # express-validator schemas
│       └── utils/                  # ApiError, responses, public user shape
├── frontend/                       # React SPA (Vite)
│   └── src/
│       ├── api/client.js           # axios instance (token interceptor)
│       ├── components/             # reusable UI (table, modal, stars, …)
│       ├── context/                # Auth + Toast providers
│       ├── hooks/useDebounce.js
│       ├── layouts/MainLayout.jsx  # role-aware sidebar + topbar
│       ├── pages/                  # protected dashboards per role
│       ├── services/               # typed API callers
│       └── utils/                  # validators, formatters
├── scripts/                        # local dev helpers (PostgreSQL, smoke test)
└── README.md
```

**Design conventions**

- Controllers stay thin; business logic lives in `services/`.
- All API responses use a consistent envelope: `{ success, statusCode, message, data }` (errors: `{ success: false, statusCode, message, details? }`).
- Passwords (`passwordHash`) are never selected into API responses.

---

## Database Schema

Normalized model with three tables (plus a `Role` enum):

### `users`
| Column        | Type     | Notes                            |
| ------------- | -------- | -------------------------------- |
| id            | int      | PK                               |
| name          | text     | indexed                          |
| email         | text     | **unique**, indexed              |
| password_hash | text     | `bcrypt` hash — never exposed    |
| address       | text?    | indexed                          |
| role          | enum     | `SYSTEM_ADMIN` / `NORMAL_USER` / `STORE_OWNER` |
| created_at / updated_at | timestamp | |

### `stores`
| Column     | Type  | Notes                                |
| ---------- | ----- | ------------------------------------ |
| id         | int   | PK                                   |
| name, email, address | text | all indexed                  |
| owner_id   | int   | FK → `users.id` (a store owner)      |

### `ratings`
| Column     | Type | Notes                                          |
| ---------- | ---- | ---------------------------------------------- |
| id         | int  | PK                                             |
| user_id    | int  | FK → `users.id`, indexed                       |
| store_id   | int  | FK → `stores.id`, indexed                      |
| rating     | int  | `CHECK (rating BETWEEN 1 AND 5)`               |
| created_at / updated_at | timestamp |                                |

**Uniqueness:** `(user_id, store_id)` — a user can rate a store only once. Re-submitting updates the existing row (upsert). The average rating is **computed on the fly** with database aggregation (`AVG`) — it is never denormalized.

---

## User Roles

| Role          | Capabilities                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------- |
| SYSTEM_ADMIN  | Dashboard stats, manage stores, manage users, create users/stores, change own password        |
| STORE_OWNER   | Own-store dashboard (avg rating, total ratings, breakdown), list rating users, change password |
| NORMAL_USER   | Search & browse stores, submit/modify ratings, change own password                            |

Roles are enforced **on the backend** with `authenticateUser` + `requireRole(...)` middleware and mirrored in the frontend navigation and route guards. New registrations always receive `NORMAL_USER` — nobody can self-assign a role.

---

## Getting Started

### Prerequisites

- **Node.js 18+** (Node 24 verified)
- **npm**
- **PostgreSQL 14+**

> **No PostgreSQL installed?** On Windows you can run a fully-contained instance without admin rights:
>
> ```powershell
> powershell -ExecutionPolicy Bypass -File scripts/setup-portable-postgres.ps1
> ```
>
> This downloads the official PostgreSQL binaries, initializes a data directory and starts
> `localhost:5432`. `scripts/start-local-postgres.ps1` / `scripts/stop-local-postgres.ps1` start and stop it later.

### 1. Backend

```bash
cd backend
npm install

# copy the example config and fill in your values
cp .env.example .env        # Windows: copy .env.example .env

# create/apply the database migrations
npx prisma migrate dev --name init

# seed sample data
npm run db:seed
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

### 3. Run

```bash
# terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open <http://localhost:5173>. If port 5173 is already in use, Vite automatically picks the next free port (shown in the terminal). The Vite dev server proxies `/api/*` to the backend, so no CORS configuration is needed during development.

---

## Environment Variables

### Backend — `backend/.env.example`

```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/store_rating
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Generate a secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`

### Frontend — `frontend/.env.example`

```bash
# Leave empty to use the Vite dev proxy (recommended for local dev)
VITE_API_URL=
# Backend target used by the Vite proxy
VITE_API_PROXY_TARGET=http://localhost:5000
```

> `.env` files contain secrets and are git-ignored — never commit them.

---

## Database Migration

Prisma migrations live in `backend/prisma/migrations`:

```bash
cd backend
npx prisma migrate dev --name <migration_name>   # create + apply during development
npx prisma migrate deploy                        # apply migrations in production
npx prisma generate                              # regenerate the client after schema edits
```

The `ratings` table ships with a `CHECK (rating BETWEEN 1 AND 5)` constraint applied by an explicit migration, with the application also validating before writes.

---

## Seed Data & Test Credentials

Run the seed to populate the database with realistic data (1 admin, 7 normal users, 4 store owners, 8 stores, 46 ratings):

```bash
cd backend
npm run db:seed
```

**Every seeded account uses the password: `Welcome@123`**

| Role          | Email                        |
| ------------- | ---------------------------- |
| System Admin  | `admin@storehub.io`          |
| Store Owner   | `meera.rk@example.com`       |
| Store Owner   | `adarsh.desai@example.com`   |
| Store Owner   | `sneha.nair@example.com`     |
| Store Owner   | `gaurav.patil@example.com`   |
| Normal User   | `ananya.rao@example.com`     |
| Normal User   | `vikram.kulkarni@example.com`|
| Normal User   | `ishita.verma@example.com`   |

Passwords are never hardcoded in the frontend; they only exist in the seed script (hashed with `bcrypt`).

---

## Running the Backend

```bash
cd backend
npm run dev     # auto-restarts on change (node --watch)
npm start       # plain start
```

The API responds at `http://localhost:5000/api`. Health check: `GET /api/health`.

---

## Running the Frontend

```bash
cd frontend
npm run dev     # dev server with /api proxy
npm run build   # production build (dist/)
npm run preview # serve the production build
```

---

## API Overview

All endpoints return JSON with an envelope: `{ success, statusCode, message, data }`.

| Method | Endpoint                            | Access                        | Description                              |
| ------ | ----------------------------------- | ----------------------------- | ---------------------------------------- |
| POST   | `/api/auth/register`                | public                        | Register (always creates a normal user)  |
| POST   | `/api/auth/login`                   | public                        | Log in → JWT + user                      |
| POST   | `/api/auth/logout`                  | authenticated                 | Log out                                  |
| PUT    | `/api/auth/password`                | authenticated                 | Change own password                      |
| GET    | `/api/users/me`                     | authenticated                 | Current profile (owners include store)   |
| GET    | `/api/users`                        | admin                         | List users (search/filter/sort/page)     |
| GET    | `/api/users/:id`                    | admin                         | User details (+ store/avg for owners)    |
| POST   | `/api/users`                        | admin                         | Create user (any role)                   |
| GET    | `/api/stores`                       | authenticated                 | List stores (search/sort/page, own rating) |
| GET    | `/api/stores/:id`                   | authenticated                 | Store with aggregate rating              |
| POST   | `/api/stores`                       | admin                         | Create store (owner must be a store owner) |
| GET    | `/api/stores/:storeId/ratings`      | owner (own store) / admin     | Rating users of a store                  |
| POST   | `/api/stores/:storeId/ratings`      | normal user                   | Submit rating (upsert)                   |
| PUT    | `/api/stores/:storeId/ratings`      | normal user                   | Modify existing rating                   |
| GET    | `/api/admin/dashboard`              | admin                         | Platform statistics                      |
| GET    | `/api/store-owner/dashboard`        | owner                         | Own store's rating overview              |
| GET    | `/api/store-owner/ratings`          | owner                         | Users who rated the owner's store        |

**Query parameters for lists**

```
GET /api/users?page=1&limit=10&search=anand&role=STORE_OWNER&sortBy=name&order=asc
GET /api/stores?page=1&limit=10&search=abc&sortBy=rating&order=desc
GET /api/stores/:storeId/ratings?page=1&limit=10&sortBy=rating&order=desc
```

Searching, filtering, sorting and pagination are all executed **in the database**, never by downloading everything to the client.

**Status codes** — `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`.

---

## Validation Rules

Applied on **both** the frontend and the backend (backend is authoritative).

| Field    | Rules                                                                                     |
| -------- | ----------------------------------------------------------------------------------------- |
| Name     | 20–60 characters                                                                          |
| Address  | ≤ 400 characters                                                                          |
| Email    | Standard email format                                                                     |
| Password | 8–16 chars, ≥1 uppercase letter, ≥1 special character — `^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$` |
| Rating   | Integer 1–5                                                                               |

Clear error messages are shown inline in forms and in toast notifications.

---

## Security

- `bcrypt` (cost 10) password hashing; no plain-text passwords anywhere.
- JWT contains `id`, `role`, `email`; protected routes verify the signature.
- `authenticateUser` + `requireRole(...)` middleware enforce authorization **server-side** on every protected/role-specific route.
- The authenticated identity always comes from the JWT (`req.user`), never from client-supplied IDs — e.g. when a user submits a rating, the `userId` comes from the token, not the request body.
- Store owners can only view ratings for their own store (verified against `store.ownerId`).
- Email uniqueness is enforced by a DB unique index and surfaced as `409 Conflict`.
- Parameterized ORM queries (Prisma) throughout — no string concatenation of user input into SQL.
- `rating BETWEEN 1 AND 5` CHECK constraint at the database level.
- Configured CORS (env-driven origin list), rate-limiting-ready Express app, centralized error handler that never leaks stack traces in production.
- Passwords are never included in API responses.

---

## Testing

A runnable end-to-end API smoke test is included:

```bash
# with the backend running and a freshly seeded database:
cd backend
node ../scripts/api-smoke-test.js
```

It exercises registration, login/logout, password change, role restrictions (401/403), admin CRUD, search/filter/sort/pagination, rating submit/modify, average-rating calculation, duplicate email conflicts and validation errors (pass/fail summary printed at the end).

Manual test checklist:

- [x] Register (auto `NORMAL_USER`, role cannot be chosen)
- [x] Login → redirect per role; wrong credentials → 401
- [x] Logout (token cleared)
- [x] Password update (current + new rules)
- [x] Admin dashboard stats
- [x] Admin create user / store; duplicate email → 409
- [x] Admin store list: search, sort (incl. by rating), pagination, “No ratings” state
- [x] Admin user list: search, role filter, sort, pagination, details modal with owner store + avg rating
- [x] Normal user: search stores, submit rating (201), modify rating (200/PUT), one-rating-per-store
- [x] Average rating recomputed dynamically after updates
- [x] Store owner: dashboard avg + total + breakdown, rating-users table with sorting
- [x] RBAC: normal user → 403 on admin/owner APIs; owner → 403 on admin APIs and other stores' ratings
- [x] Responsive UI (mobile sidebar drawer, fluid grids)

---

## Screenshots

*Screenshots will be added here.*

---

## Deployment

### Backend (any Node host / provider)

1. Provision a PostgreSQL instance and set `DATABASE_URL`.
2. Set `JWT_SECRET` to a long random value and `CLIENT_URL` to your frontend origin.
3. Install dependencies and build:
   ```bash
   cd backend
   npm ci --omit=dev
   npx prisma migrate deploy
   node src/server.js          # or use pm2 / a process manager
   node prisma/seed.js         # optional, for demo data
   ```

### Frontend (any static host)

```bash
cd frontend
npm ci
npm run build                 # outputs dist/
```

Serve `dist/`, then make sure API requests resolve to the backend. Either:

- set `VITE_API_URL` to the backend origin **before** `npm run build`, and enable CORS on the backend with the correct `CLIENT_URL`; or
- reverse-proxy `/api` to the backend (e.g. NGINX or Vercel rewrites).

### Docker (optional)

```dockerfile
# backend/Dockerfile (example)
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "src/server.js"]
```

Run migrations as part of the deployment pipeline (`npx prisma migrate deploy`) before starting new replicas.