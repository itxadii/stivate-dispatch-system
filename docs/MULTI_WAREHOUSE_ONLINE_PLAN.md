# Multi-warehouse online platform: plan

**Goal:** every warehouse keeps dispatching from the desktop app, all dispatch data lands in one central database (Neon Postgres), and senior management sees consolidated dashboards and reports across warehouses from a web browser.

**Status:** proposal · **Last updated:** 2026-11-09

---

## 1. Summary

| | Today | Target |
|---|---|---|
| Data | One SQLite file per PC (`warehouse.db`) | One Neon Postgres database for all warehouses, plus a local SQLite cache on each PC |
| Who sees what | Only the PC that created the data | Operators see their warehouse; management sees all warehouses |
| Reports | Per PC, emailed from the PC | Consolidated, filterable by warehouse, scheduled from the server |
| Login | Shared hard-coded passwords (`i3pl@123`) | Named user accounts with roles |
| Secrets | AWS and SMTP credentials compiled into the installer | Credentials only on the server; the desktop app holds a per-device token |
| Offline | Fully offline | Still works offline, syncs when the connection returns |

The desktop app stays, because warehouse floors need silent printing to label and challan printers, barcode scanners, and resilience to internet drops. What changes is **where the data lives**, so we add two new pieces:

1. **An API service** that owns the database connection, authentication and business rules.
2. **A web dashboard** for management, reusing the existing React components and design system.

> **Why not connect the desktop app straight to Neon?** A Postgres connection string in the installer gives anyone who unpacks it full read and write access to every warehouse's data. It can't be revoked per PC and can't enforce "this warehouse only" rules. It also breaks whenever the internet drops. An API layer in between is non-negotiable for production.

---

## 2. Step zero: security fixes (do this first, regardless of the rest)

These are live risks in the shipped app today:

1. **Rotate the AWS access key** hard-coded in `electron/ipc/backup.ts`. It is in git history and inside every installer (`app.asar` can be unpacked by anyone). Create a new key, then delete the old one in IAM.
2. **Change the SMTP password** hard-coded in `electron/ipc/email.ts`.
3. **Check whether the GitHub repo `itxadii/stivate-invoice-system-i3pl` is public.** It is the auto-update source. If it's public, treat both secrets as already leaked.
4. **The `i3pl@123` unlock password** is checked in the browser code (`UnlockModal.tsx`, `ReportsUnlockGate.tsx`) and printed in the in-app user guide. It only hides UI and protects nothing. Real roles replace it in Phase 2.

Until Phase 3 removes S3 and SMTP from the desktop app entirely, give the new AWS key a policy limited to `s3:PutObject`/`s3:GetObject` on the one backup bucket.

---

## 3. Target architecture

```
 Warehouse PCs (Electron)                Cloud                              Management
 ┌───────────────────────┐        ┌──────────────────────────┐        ┌──────────────────┐
 │ React UI (existing)   │        │  API service (Node/TS)   │        │ Web dashboard    │
 │ Local SQLite cache    │ HTTPS  │  - auth & roles          │ HTTPS  │ (React, browser) │
 │  + outbox queue       │◄──────►│  - dispatch rules        │◄──────►│ consolidated     │
 │ Printers, scanners    │  sync  │  - sync endpoints        │        │ reports & export │
 └───────────────────────┘        │  - report queries        │        └──────────────────┘
                                  │  - scheduled emails/PDFs │
                                  └────────────┬─────────────┘
                                               │ pooled connection
                                     ┌─────────▼─────────┐     ┌──────────────────┐
                                     │  Neon Postgres    │     │ S3: PDFs,        │
                                     │  (single source   │     │ exports, nightly │
                                     │   of truth)       │     │ pg_dump          │
                                     └───────────────────┘     └──────────────────┘
```

### Technology choices

| Piece | Choice | Why |
|---|---|---|
| Database | **Neon Postgres** | As planned. Managed, branchable (a copy per dev and staging environment), point-in-time restore. |
| API | **Node + TypeScript, Fastify** (or Hono) | Same language as the app. Shares types with the desktop and web apps. |
| ORM and migrations | **Drizzle ORM** + `drizzle-kit` | Typed SQL, plain migration files, first-class Neon driver support. |
| API hosting | A managed long-running container (e.g. Render, Fly.io or AWS App Runner) | Avoids serverless cold starts, and cron and PDF generation are straightforward. You already use AWS, so App Runner keeps billing in one place. |
| Web dashboard | **Vite + React** with the existing `index.css` design system and `components/ui.tsx` | Same look and components as the desktop app, so no second UI to maintain. |
| Auth | A managed identity provider (e.g. Clerk, Auth0, or Neon Auth if it fits) issuing JWTs | Password resets, 2FA for management, and audit come built in. Avoid hand-rolling auth. |
| Repo layout | Monorepo with npm/pnpm workspaces: `apps/desktop`, `apps/web`, `apps/api`, `packages/shared` | One place for types (`Dispatch`, `DispatchItem`), validation (zod) and UI components. |
| Monitoring | Sentry (desktop, web, API) plus uptime checks on the API | You need to know when a warehouse stops syncing before they tell you. |

---

## 4. Data model (Postgres)

Every business row carries a `warehouse_id`. That single column is what makes consolidated reporting possible, and what lets us restrict each warehouse to its own data.

```sql
-- Tenancy & people
warehouses        (id uuid pk, code text unique,        -- e.g. 'FWH', 'CHK'
                   name text, address text, timezone text default 'Asia/Kolkata',
                   active bool, created_at timestamptz)
users             (id uuid pk, auth_provider_id text unique, name text, email text,
                   active bool, created_at timestamptz)
user_roles        (user_id uuid, warehouse_id uuid null,  -- null = all warehouses
                   role text check (role in ('operator','warehouse_admin','viewer','org_admin')),
                   primary key (user_id, coalesce(warehouse_id, '0000…')))
devices           (id uuid pk, warehouse_id uuid, name text, token_hash text,
                   last_seen_at timestamptz, app_version text, revoked_at timestamptz)

-- Dispatch data (mirrors today's SQLite tables)
dispatches        (id uuid pk,                 -- UUIDv7, generated on the PC
                   warehouse_id uuid not null references warehouses,
                   dc_no text not null,         -- unique per warehouse, see §5
                   dispatched_at timestamptz,   -- replaces free-text `date`
                   vehicle_no text, vehicle_size text, supervisor text,
                   consignee_address text, total_pallets int, total_parts int,
                   particular text, scanning_by text, verify_by text,
                   transaction_type text, is_empty_pallets bool,
                   status text check (status in ('loading','ready','completed')),
                   created_by uuid references users, created_at timestamptz,
                   updated_at timestamptz, version int not null default 1,
                   deleted_at timestamptz,      -- soft delete, never hard delete
                   unique (warehouse_id, dc_no))
dispatch_items    (id uuid pk, dispatch_id uuid references dispatches on delete cascade,
                   pull_list_no text, id_number text, kit_type text, workcell text,
                   parts int, verified bool,     -- replaces the '_pending' suffix hack
                   verified_at timestamptz, verified_by uuid)

-- Master & lookup data (today stored as text blobs in settings.json)
pull_list_master  (warehouse_id uuid, pull_list_no text, id_number text, kit_type text,
                   workcell text, parts int, barcode text, imported_at timestamptz,
                   primary key (warehouse_id, pull_list_no))
consignees        (id uuid pk, warehouse_id uuid, name text, address text, is_default bool, active bool)
supervisors / operators / vehicles / vehicle_sizes   -- same shape: id, warehouse_id, value, is_default, active
report_recipients (id uuid pk, warehouse_id uuid null, name text, email text,
                   frequency text, enabled bool)

-- Accountability
audit_logs        (id bigserial, warehouse_id uuid, user_id uuid, device_id uuid,
                   action text, entity text, entity_id uuid, diff jsonb, created_at timestamptz)
```

Changes from today worth calling out:

- **`date` (free text) → `dispatched_at timestamptz`.** Cross-warehouse "today" and monthly reports need real timestamps with a timezone. Each warehouse stores its own timezone.
- **`_pending` suffix on `pull_list_no` → `verified` boolean.** The current trick breaks searching and joins.
- **Dropdown lists move out of `settings.json` into tables**, so management can see and audit them, and each warehouse can have its own.
- **Soft deletes plus `version`**, needed for safe sync and for audit.
- **Indexes for reporting:** `(warehouse_id, dispatched_at desc)`, `(warehouse_id, status)`, `(vehicle_no)`, `(supervisor)`, and `dispatch_items(pull_list_no)`.

**Access rule enforced in the API (and optionally Postgres row-level security):** every query is filtered by the warehouses the caller's role allows. Operators and warehouse admins get one warehouse; `viewer`/`org_admin` with `warehouse_id = null` get all.

---

## 5. Offline-first sync

A warehouse can't stop loading trucks because the internet is down, so the desktop app keeps working locally and syncs in the background.

### How it works

1. The **local SQLite stays** as a cache of this warehouse's data (recent dispatches, masters, lookup lists).
2. Every local write also appends a row to an **`outbox`** table: `{op_id (uuid), entity, entity_id, payload, base_version, created_at}`.
3. A background **sync loop** (every few seconds while online, immediately after a save) does:
   - **push:** `POST /sync/push` with pending outbox ops. The server applies them in a transaction. It is idempotent on `op_id`, so retries are safe.
   - **pull:** `GET /sync/pull?since=<cursor>` returns rows changed since the last cursor (lookup lists, masters, edits made by other PCs in the same warehouse).
4. The UI header gets a sync indicator next to the existing "Database online" chip: *Synced*, *3 changes waiting*, or *Offline since 10:42*.

### Conflict rules (kept deliberately simple)

- A dispatch belongs to one warehouse and is edited almost exclusively by that warehouse, so real conflicts are rare.
- The server compares `base_version` with the current `version`. If they match, the change is applied and `version + 1` is stored. If they don't, the server rejects the change and the app shows "This dispatch was changed on another PC — reload".
- `completed` dispatches outside the editable window (today: last 5) are rejected server-side, not just hidden in the UI.

### DC numbers

Today `generateDCNumber` reads the local DB for the day's max sequence (`DC-YYMMDD-001`). Across many PCs this would create duplicates. The plan:

- **Prefix with the warehouse code:** `DC-FWH-261109-001`. That makes it unique across warehouses, and the challan shows where it came from.
- **One PC per warehouse:** the local sequence is safe even offline.
- **Several PCs in one warehouse:** each device is issued a **block of reserved sequence numbers** (e.g. 50 at a time) by the API while online, and uses them up offline. Simplest alternative: add a 1-letter device suffix (`DC-FWH-A-261109-001`). Decide with the client which is acceptable on printed challans.
- The database enforces `unique (warehouse_id, dc_no)` as the final guard.

---

## 6. Web dashboard for management

Reuses the desktop UI components, so it looks like the same product.

**Pages**

1. **Overview:** the same stat cards (dispatches today, total, fleet utilization, pending pull lists) **summed across warehouses**, with a warehouse filter (multi-select) and a date-range picker at the top.
2. **Warehouse comparison:** a table and bar chart per warehouse covering dispatches, pallets, parts, utilization % and average loading time. Click through to one warehouse.
3. **Trend:** dispatches per day/week/month, one line per warehouse or combined.
4. **Fleet utilization:** the existing tracker, across warehouses (vehicle × warehouse).
5. **Dispatch search:** find any DC, vehicle or pull list across all warehouses. Read-only detail view and challan PDF download.
6. **Reports:** today's loading summary and day/month/vehicle/supervisor reports with a warehouse column, plus Excel/PDF export generated on the server.
7. **Admin (org_admin only):** warehouses, users and roles, devices (register/revoke a PC), report recipients.

**Performance for consolidated reports:** start with plain indexed queries, which are fine into the low millions of rows. When dashboards slow down, add a `daily_warehouse_stats` rollup table (one row per warehouse per day) refreshed by the API on each sync and nightly. The dashboard reads the rollup; drill-downs read raw rows.

---

## 7. What moves from the desktop to the server

| Feature | Today (desktop) | Target |
|---|---|---|
| Dispatch CRUD | `ipc/database.ts` → SQLite | Local SQLite + outbox → API → Neon |
| Reports | `db:getReports` on local data | API endpoint over all permitted warehouses. Desktop shows its own warehouse; web shows all. |
| Daily/weekly utilization email | `ipc/email.ts` with SMTP creds on the PC | **Server cron job.** One consolidated email per recipient, per warehouse or across all. SMTP creds live only on the server. |
| Cloud backup to S3 | `ipc/backup.ts` with AWS keys on the PC | **Removed from desktop.** Neon point-in-time restore plus a nightly `pg_dump` to S3 from the server. Keep the local SQLite export as an offline safety net. |
| Challan/barcode PDF + printing | `ipc/printer.ts` | **Stays on desktop** (local printers). Also expose challan PDF generation on the server for the web "download challan" button. Move the PDF layout code into `packages/shared` so both use it. |
| Pull list master import | Local CSV import | Upload through the API into `pull_list_master` for that warehouse, then synced down to its PCs. |
| Settings / dropdown lists | `settings.json` | Lookup tables, edited by warehouse admins (desktop or web), synced down. Printer names stay local per PC. |
| Auto-update | GitHub releases | Unchanged. Add a minimum supported app version the API can enforce. |

---

## 8. Phased delivery

Each phase ships something usable and can be paused after. Effort figures are rough estimates for one developer and should be re-estimated after Phase 0.

| Phase | Scope | Exit criteria | Rough effort |
|---|---|---|---|
| **0. Security & groundwork** | §2 fixes. Restructure into a monorepo. Move shared types and the design system into `packages/shared`. Set up a Neon project with `main`, `staging` and `dev` branches. | Old keys revoked. App builds from the monorepo. | ~1 week |
| **1. API + schema + read-only upload** | Drizzle schema (§4), Fastify API, device registration, `POST /sync/push` for dispatches only. Desktop pushes new and changed dispatches (one-way); local SQLite stays the app's source of truth. One-time **import of each warehouse's existing `warehouse.db`**. | All warehouses' historical and new dispatches visible in Neon. | 2–3 weeks |
| **2. Web dashboard + real logins** | Auth provider, roles, the web dashboard (§6) on top of Neon. Server-side consolidated reports and Excel export. | Management logs in and sees consolidated numbers that match each warehouse's own reports. | 3–4 weeks |
| **3. Two-way sync + server-side jobs** | Pull sync, lookup tables, pull list master via API, DC numbering (§5), conflict handling. Scheduled emails moved to the server; S3 and SMTP removed from the desktop. Operator login on desktop replaces `i3pl@123`. | A PC can be wiped and rebuilt from the server. No secrets left in the installer. | 3–4 weeks |
| **4. Hardening & rollout** | Load test, monitoring and alerts, backup restore drill, runbooks. Pilot one warehouse for 2 weeks, then roll out the rest one by one. | §9 checklist all green. | 2 weeks + pilot |

Phase 1 alone already solves the core problem (consolidated data in one place) with minimal risk, because the desktop app keeps working exactly as today.

### Migrating existing data

For each warehouse:

1. Create its `warehouses` row and code.
2. Run an import script on that warehouse's `warehouse.db`. It maps old integer ids to UUIDs, converts `date` text to `dispatched_at` using the warehouse timezone, converts `_pending` to `verified = false`, and prefixes old DC numbers only if they collide.
3. Reconcile: compare counts and totals (dispatches, items, parts, pallets) per day between SQLite and Neon, and sign off with the warehouse.

---

## 9. Production-readiness checklist

**Security**
- [ ] No secrets in the desktop app or the git repo. Server secrets live in the host's secret manager.
- [ ] HTTPS only. Device tokens are stored hashed and can be revoked from the admin page.
- [ ] Every API query is scoped by the caller's permitted warehouses (plus automated tests proving an operator can't read another warehouse).
- [ ] 2FA required for `org_admin` and management accounts.
- [ ] Audit log for create, edit, delete, status change and login.
- [ ] Rate limiting and request size limits on the API. Input validated with zod schemas shared with the client.

**Data safety**
- [ ] Neon point-in-time restore enabled, with the retention window checked against the plan you buy.
- [ ] Nightly `pg_dump` to a separate S3 bucket with versioning and a lifecycle rule.
- [ ] **A tested restore**: restore last night's dump into a Neon branch once a month and verify the counts.
- [ ] Soft deletes only for dispatches. Hard deletes are admin-only and audited.
- [ ] Migrations run in CI against a Neon staging branch before production.

**Reliability**
- [ ] Desktop works fully offline, and the outbox survives app restarts and PC reboots.
- [ ] Sync is idempotent (`op_id`) and retried with backoff.
- [ ] Pooled Neon connection string for the API, with connection limits sized to the host.
- [ ] Health endpoint plus uptime monitor. Alert if any warehouse hasn't synced in more than 30 minutes during working hours.
- [ ] Sentry on desktop, web and API, with release tags matching app versions.

**Operations**
- [ ] Environments: `dev` → `staging` → `production`, each with its own Neon branch/project.
- [ ] CI: typecheck, lint, tests, build, and migration dry-run on every PR.
- [ ] Runbooks for "warehouse not syncing", "restore a deleted dispatch", "rotate a device token", "add a new warehouse".
- [ ] Minimum app version enforced by the API, so old installers can't write bad data.

**Compliance & policy**
- [ ] Update `docs/PRIVACY_POLICY.md` and `docs/SECURITY_POLICY.md`: they currently describe an offline-only system.
- [ ] Data residency: confirm with the client whether data must stay in India, and choose the Neon region accordingly (check Neon's current region list; pick the closest available).

---

## 10. Costs to budget for

Exact numbers depend on plan tiers and usage, so check current pricing before committing:

- **Neon:** a paid plan for production (for point-in-time restore retention and to avoid compute auto-suspend delays during working hours). Dispatch data volume is small; compute hours matter more than storage.
- **API hosting:** one small always-on container per environment.
- **Auth provider:** usually priced per monthly active user. The user count here is small.
- **Sentry, uptime monitoring:** free tiers are likely enough to start.
- **S3:** existing bucket, negligible.

---

## 11. Decisions needed from the client

1. Several PCs per warehouse? This decides the DC numbering approach in §5.
2. Is the warehouse code in the DC number acceptable on printed challans?
3. Who are the management users, and should they see all warehouses or a region?
4. Data residency requirement (India-only or not).
5. Should consolidated report emails go to management daily, weekly, or both?
6. Is the existing per-warehouse history to be migrated, and from what date?
