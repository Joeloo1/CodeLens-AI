# Node.js + TypeScript + Express Starter

A modern, production-ready boilerplate for building scalable and secure REST APIs using Express 5 and TypeScript 6, backed by PostgreSQL and Prisma ORM.

## 🚀 Features

- **Standard Tech Stack**: Node.js, Express 5, and TypeScript 6.
- **Database**: PostgreSQL 16 via Docker Compose with a persistent named volume.
- **Prisma ORM**: Type-safe database access, schema management, and migrations powered by `@prisma/client` and the `@prisma/adapter-pg` driver adapter.
- **Security Hardened**: Pre-configured with `helmet` for security headers and `express-rate-limit` to prevent brute force attacks.
- **Graceful Shutdown**: Properly handles `SIGTERM` and `SIGINT` signals for clean exits in containerized environments.
- **Advanced Logging**: Centralized logging using `winston` (with file rotation support) and HTTP request logging via `morgan`.
- **Path Aliases**: Clean imports using `@/` aliases (e.g., `@/services/...` instead of `../../../services/...`).
- **Code Quality**: Pre-configured ESLint 10 and Prettier for consistent code style.
- **Error Handling**: Standardized `AppError` class and centralized global error middleware.
- **Environment Management**: Type-safe environment variable configuration using `dotenv`.

---

## 📂 Project Structure

```text
.
├── prisma/
│   ├── schema.prisma   # Prisma data model and datasource config
│   └── migrations/     # Auto-generated migration history
├── src/
│   ├── config/         # Environment variables and logger configuration
│   ├── controller/     # Request handlers (logic for routes)
│   ├── generated/
│   │   └── prisma/     # Auto-generated Prisma client
│   ├── middleware/      # Express middlewares (auth, error handling, etc.)
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic layer
│   ├── utils/          # Utility classes and helper functions
│   ├── app.ts          # Express app initialization
│   └── server.ts       # Server entry point and graceful shutdown logic
├── docker-compose.yml  # PostgreSQL service definition
└── prisma.config.ts    # Prisma CLI configuration
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (v10+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose (for running PostgreSQL locally)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd node-ts-express-starter
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:password@localhost:5434/backend_db_starter
   ```

### Database Setup

1. Start the PostgreSQL container:

   ```bash
   docker compose up -d
   ```

2. Run Prisma migrations to apply your schema:

   ```bash
   pnpm prisma migrate dev
   ```

3. (Optional) Generate the Prisma client manually:

   ```bash
   pnpm prisma generate
   ```

4. (Optional) Open Prisma Studio to browse your data:

   ```bash
   pnpm prisma studio
   ```

> **Docker defaults** — the Compose file exposes PostgreSQL on port **5434** (to avoid conflicts with a local Postgres on 5432). Credentials: user `postgres`, password `password`, database `backend_db_starter`.

---

### Development

Run the server in development mode with hot-reloading:

```bash
pnpm dev
```

### Production

1. Build the project:

   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

---

## 🗄️ Database Commands

| Command                      | Description                            |
| ---------------------------- | -------------------------------------- |
| `docker compose up -d`       | Start PostgreSQL in the background     |
| `docker compose down`        | Stop and remove containers             |
| `pnpm prisma migrate dev`    | Create & apply a new migration         |
| `pnpm prisma migrate deploy` | Apply pending migrations (production)  |
| `pnpm prisma generate`       | Regenerate the Prisma client           |
| `pnpm prisma studio`         | Open the visual database browser       |
| `pnpm prisma db push`        | Push schema changes without migrations |

---

## 🧹 Code Quality

- **Linting**: `pnpm lint` or `pnpm lint:fix`
- **Formatting**: `pnpm format`

---

## 🛡️ License

This project is licensed under the [ISC License](LICENSE).
