# Jobs-First ERP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move daily operations from project-first to job-first while keeping projects as optional groups for larger engagements.

**Architecture:** Add a `jobs` table with optional `project_id`, keep existing `projects` flows intact, and route new purchasing allocation through job-linked line items stored in PO JSON. The first implementation phase adds Jobs CRUD/listing and lets each PO item choose a Job; later phases can move invoices and bills to dedicated line-item tables.

**Tech Stack:** Next.js App Router, React client components, Supabase Postgres, Supabase server actions, Vitest, ESLint.

---

### Task 1: Schema And Types

**Files:**
- Create: `supabase/migrations/202605230002_jobs_first_schema.sql`
- Modify: `src/types/database.ts`

- [x] Add `public.jobs` with `client_id`, nullable `project_id`, name/type/status/dates/quote/description fields.
- [x] Backfill one Job per existing Project so current operational data has a Job target.
- [x] Add `jobs` RLS policy through the same authenticated staff pattern.
- [x] Add `JobRow` TypeScript type and relation fields.

### Task 2: Data And Actions

**Files:**
- Modify: `src/lib/erp-data.ts`
- Modify: `src/app/actions.ts`

- [x] Add `getJobsPageData`.
- [x] Include jobs in purchasing page data.
- [x] Add `createJobAction`.
- [x] Extend PO item JSON parsing to preserve `jobId`.
- [x] Revalidate `/jobs` when purchase orders change.

### Task 3: Jobs UI And Navigation

**Files:**
- Modify: `src/components/app-shell.tsx`
- Create: `src/app/jobs/page.tsx`
- Create: `src/components/job-table.tsx`

- [x] Add Jobs menu as the primary work hub.
- [x] Keep Projects as an optional grouping menu below Invoice.
- [x] Build a Jobs page with list-first table and compact create form.

### Task 4: PO Job Allocation

**Files:**
- Modify: `src/components/purchasing-management.tsx`
- Modify: `src/app/purchasing/page.tsx`

- [x] Pass jobs into purchasing UI.
- [x] Replace PO item client selector with Job selector that displays client and optional project context.
- [x] Preserve old PO items without a job by leaving the field blank.

### Task 5: Verification

**Commands:**
- [x] `npm run lint`
- [x] `npm run sql:check`
- [x] `npm test`
- [x] `npm run build`
- [ ] Browser smoke check `/jobs` and `/purchasing` after applying the Supabase migration
