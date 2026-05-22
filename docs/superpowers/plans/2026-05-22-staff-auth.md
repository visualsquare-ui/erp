# Staff Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require Supabase Auth login before staff can view the Visual Square ERP dashboard.

**Architecture:** Use `@supabase/ssr` clients for browser, server, and proxy contexts. Protect the dashboard in the server component with a verified user check, and use server actions for email/password sign-in and sign-out.

**Tech Stack:** Next.js App Router, Server Actions, Supabase Auth, `@supabase/ssr`, Vitest.

---

### Task 1: Auth Helpers

**Files:**
- Create: `src/lib/auth-routes.test.ts`
- Create: `src/lib/auth-routes.ts`
- Replace: `src/lib/supabase.ts` with `src/lib/supabase/index.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/proxy.ts`

- [ ] Add tests for protected-route redirect destinations and post-login redirects.
- [ ] Add environment helpers that accept either the current legacy anon key or the newer Supabase publishable key.
- [ ] Add server/browser Supabase client factories.

### Task 2: Login And Session UI

**Files:**
- Create: `src/app/login/actions.ts`
- Create: `src/app/login/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/app-shell.tsx`
- Create: `src/components/sign-out-button.tsx`
- Create: `proxy.ts`

- [ ] Protect `/` by redirecting unauthenticated users to `/login?next=/`.
- [ ] Add a branded login form with email/password fields.
- [ ] Add a sign-out button in the app shell.
- [ ] Add a root proxy to refresh Supabase auth cookies.

### Task 3: Verification

**Files:**
- Modify only if verification finds issues.

- [ ] Run `npm test`.
- [ ] Run `npm run sql:check`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start the local dev server and verify unauthenticated users see `/login`.
- [ ] Commit the auth work.
