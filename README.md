# Appointment Booking CRM – Full-Stack Starter

This is a runnable starter for your **Appointment Booking CRM** with:

- **Backend**: Node.js + Express + Prisma + SQLite (file DB)
- **Frontend**: Vite + React + Tailwind CSS + lucide-react + framer-motion
- **Run together** with a single command

> ⚠️ This is a starter to get you live quickly. Feel free to ask for upgrades (Auth, RBAC, Postgres, Stripe test mode, Docker, e2e tests, etc.).

## Quickstart

```bash
# 1) Extract and enter the folder
unzip appointment-crm-starter.zip
cd appointment-crm-starter

# 2) Install deps (installs API + Web workspaces)
npm install

# 3) Prepare DB (generate Prisma client & seed demo data)
npm --prefix apps/api run db:setup

# 4) Run both API and Web together
npm run dev
```
- Frontend dev server: http://localhost:5173
- Backend API: http://localhost:4000

## Environment

The API uses SQLite by default (file: `apps/api/prisma/dev.db`). You can switch to Postgres later by editing `prisma/schema.prisma` and setting `DATABASE_URL` in `apps/api/.env`.

## API Overview (selected)

- `GET /api/health` – health check
- `GET /api/appointments` – list
- `POST /api/appointments` – create (conflict-checked)
- `PATCH /api/appointments/:id` – update status/time
- `DELETE /api/appointments/:id` – delete
- Similar CRUD for `/api/clients`, `/api/staff`, `/api/services`
- `GET /api/invoices`, `POST /api/invoices`, `POST /api/payments/collect` (dummy payment)

The web app proxies `/api/*` to `http://localhost:4000` in dev.

## Build for production

```bash
npm run build
# Start API (serves built web too)
npm --prefix apps/api start
# Serve web separately if desired
npm --prefix apps/web start
```

---

**Need more?** Ask for: JWT auth w/ refresh tokens, role-based permissions, Stripe test mode, emailing (Resend/SES), webhooks, calendar sync, ICS exports, or Docker Compose.
# Screen-Resume-with-NLP
