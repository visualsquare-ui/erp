# Visual Square ERP Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the Supabase PostgreSQL schema for the 12-table Visual Square ERP data model and prepare it for authenticated internal staff access.

**Architecture:** Use one idempotent SQL migration that creates enums, tables, foreign keys, updated-at triggers, RLS policies, API grants, and sample records. Keep the frontend on sample data until Phase 2 adds authenticated reads and CRUD screens.

**Tech Stack:** Supabase PostgreSQL, Row Level Security, Next.js environment variables.

---

### Task 1: Initial Database Migration

**Files:**
- Create: `supabase/migrations/202605220001_initial_schema.sql`

- [ ] Create enum types for project, task, invoice, payment terms, purchase order, vendor bill, and asset statuses.
- [ ] Create the 12 Phase 1 tables: `clients`, `vendors`, `projects`, `tasks`, `work_orders`, `proof_versions`, `assets`, `invoices`, `invoice_items`, `purchase_orders`, `vendor_bills`.
- [ ] Add foreign keys with `on delete cascade` where child records should follow parent projects and `on delete restrict` where money records must preserve vendor/client references.
- [ ] Add RLS policies allowing authenticated staff full access.
- [ ] Add sample data that demonstrates print, web, and branding flows.

### Task 2: Local App Config Feedback

**Files:**
- Modify: `src/components/dashboard.tsx`

- [ ] Show whether Supabase public env values are configured.
- [x] Remove sample-data fallback after authenticated CRUD pages exist.

### Task 3: Verification

**Files:**
- Modify only if verification finds issues.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Commit the migration and UI feedback changes.
