# Visual Square ERP Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Next.js ERP shell for Visual Square with the documented brand system, sidebar navigation, sample operational dashboard, and Supabase configuration surface.

**Architecture:** Use a small App Router application with static seed data so the first screen works before Supabase credentials are available. Keep formatting, navigation, and sample data in separate modules so Phase 1 can replace mocks with database queries.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, lucide-react, Supabase JS client, Vitest for utility tests.

---

### Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `.env.local.example`

- [ ] Add package scripts for `dev`, `build`, `lint`, and `test`.
- [ ] Install runtime dependencies: `next`, `react`, `react-dom`, `lucide-react`, `@supabase/supabase-js`, `clsx`, `tailwind-merge`.
- [ ] Install dev dependencies: `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`, `vitest`, `@types/node`, `@types/react`, `@types/react-dom`.
- [ ] Add `.env.local.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` placeholders.

### Task 2: Brand System And Utilities

**Files:**
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/project-rules.ts`
- Test: `src/lib/format.test.ts`
- Test: `src/lib/project-rules.test.ts`

- [ ] Write failing tests for USD formatting, US date formatting, payment due date calculation, and print-project purchase tab visibility.
- [ ] Implement format helpers with `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` and `MM/DD/YYYY` output.
- [ ] Implement project type rules: `print` shows purchase/bill workflow; `web` and `app` hide it; `logo` and `branding` show it as optional.
- [ ] Add global CSS tokens from the build spec: coral `#F57D4B`, text `#141414`, surface `#FBF6F3`, border `#E7E2DD`, tight square radii, minimal shadows.

### Task 3: Supabase Boundary And Seed Data

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/sample-data.ts`
- Create: `src/types/erp.ts`

- [ ] Add a Supabase browser client factory that returns `null` when env vars are missing.
- [ ] Define TypeScript types for Phase 0 objects: clients, vendors, projects, tasks, invoices, vendor bills, and assets.
- [ ] Add realistic sample data for a design agency and print broker, including at least one print project and one web project.

### Task 4: ERP Shell UI

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/components/app-shell.tsx`
- Create: `src/components/dashboard.tsx`
- Create: `src/components/project-table.tsx`
- Create: `src/components/metric-card.tsx`
- Create: `src/components/status-badge.tsx`

- [ ] Build a left sidebar with Visual Square logo and nav items: Dashboard, Clients, Projects, Invoices, Purchase/Bills, Portfolio.
- [ ] Build dashboard metric cards for active projects, monthly revenue, outstanding AR, outstanding AP, and urgent deadlines.
- [ ] Build a project table that demonstrates type-specific workflow visibility.
- [ ] Use the provided PNG logo from `assets/vs-logo-transparent.png`.

### Task 5: Verification And Local Preview

**Files:**
- Modify only if failures require small fixes.

- [ ] Run `npm test` and confirm utility tests pass.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev` on an available localhost port.
- [ ] Open the local app in the browser and verify the dashboard renders with the logo, sidebar, cards, and project table.
- [ ] Commit Phase 0 work to git.
