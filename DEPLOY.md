# Visual Square Deployment Guide

## Production Surfaces

This repository serves two production surfaces from one Next.js app. Keep the
domain intent separate before committing, pushing, or deploying.

- **Marketing site**: `https://visualsquare.com`
  - Public website and blog.
  - Root path `/` must show the marketing homepage.
- **ERP site**: `https://erp.visualsquare.com`
  - Internal ERP entrypoint.
  - Root path `/` must redirect to `/dashboard`.
  - Unauthenticated `/dashboard` must redirect to `/login?next=%2Fdashboard`.

## Vercel Projects

### ERP

- **Vercel team/scope**: `visual-square-s-projects`
- **Vercel project**: `erp`
- **GitHub repo**: `visualsquare-ui/erp`
- **Framework preset**: `Next.js`
- **Root directory**: `.`
- **Production domain**: `erp.visualsquare.com`
- **Default production alias**: `erp-nu-one.vercel.app`
- **Required production env vars**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Do not change the ERP project back to `Other`. If the framework preset is
`Other`, Vercel can build but still serve 404/static output instead of the
Next.js app.

The local `origin` remote should point to the ERP repo:

```bash
git remote set-url origin https://github.com/visualsquare-ui/erp.git
```

Do not push ERP work to an inaccessible or marketing-only remote such as
`visualsquare-ui/visualsquare-site`.

### Marketing

- **Production domain**: `visualsquare.com`
- Keep marketing-domain deploy settings separate from the ERP project. Do not
use marketing-domain checks to prove ERP is working.

## ⚠️ Git Author Email Requirement

Vercel (Hobby plan) blocks deployments if the commit author is not a contributing member of the Vercel project.

**Always commit with**: `jkoo@visualsquare.com`

Run once per machine to configure this repo:

```bash
git config user.email "jkoo@visualsquare.com"
git config user.name "Jaemin Koo"
```

Using `jaeminkoo@gmail.com` (personal account) will cause deployments to be **blocked** with:
> "The deployment was blocked because the commit author did not have contributing access to the project on Vercel."

## ⚠️ GitHub Account Requirement

Visual Square GitHub operations must use the `visualsquare-ui` GitHub account.
Do not push Visual Square work while authenticated as `jaeminkoo-ui`,
`simplin-ai`, `seenutech-ai`, or any other account.

Before pushing, always check:

```bash
gh auth status
```

Expected state:

- `visualsquare-ui` is the active account.
- The token is valid.
- Git operations are available for GitHub.

If the active account is not `visualsquare-ui`, or if the `visualsquare-ui`
token is invalid, stop and re-authenticate before pushing:

```bash
gh auth logout -h github.com -u jaeminkoo-ui
gh auth login -h github.com
gh auth status
```

Do not attempt `git push` for Visual Square until `gh auth status` confirms the
active valid account is `visualsquare-ui`.

For a local guard, run:

```bash
npm run preflight
```

This command delegates to the global project registry:

- `~/.codex/bin/project-preflight.mjs`
- `~/.codex/project-preflight.json`

When adding another project with different accounts/remotes/scopes, add that
project to the global registry instead of relying on memory or per-chat notes.

## Deployment Flow

Use this sequence for production changes:

1. Check the worktree and decide the deployment surface.

```bash
git status --short
npm run preflight
```

2. Run verification before committing.

```bash
npm test -- src/lib/auth-routes.test.ts
npm run build
```

3. Commit only the relevant files. Do not include unrelated local changes.

```bash
git add <files>
git commit -m "fix: route erp root to dashboard"
```

4. Push the commit.

```bash
git push origin main
```

5. Deploy the ERP project explicitly when the change affects ERP routing,
domains, env vars, or Vercel settings.

```bash
vercel --prod --scope visual-square-s-projects
```

6. Verify the exact production surface that changed.

For ERP:

```bash
curl -I https://erp.visualsquare.com/
curl -I https://erp.visualsquare.com/dashboard
curl -I https://erp.visualsquare.com/login
```

Expected ERP responses:

- `/` → `307` with `location: /dashboard`
- `/dashboard` while logged out → `307` with `location: /login?next=%2Fdashboard`
- `/login` → `200`

For marketing:

```bash
curl -I https://visualsquare.com/
```

Expected marketing response:

- `/` should not redirect to ERP.

## ERP Domain Routing Rule

The ERP root redirect is implemented in:

- `src/lib/auth-routes.ts`
- `src/app/(marketing)/page.tsx`
- `src/lib/auth-routes.test.ts`

Reason: route groups such as `(marketing)` and `(erp)` do not change public
URLs. Without host-based logic, `erp.visualsquare.com/` and
`visualsquare.com/` both resolve to the same `/` route.

If adding another ERP domain, update `ERP_HOSTS` in `src/lib/auth-routes.ts`
and add/adjust the corresponding test.

## Common Failure Modes

- `DEPLOYMENT_NOT_FOUND`: the domain is configured but no production deployment
  is assigned.
- `NOT_FOUND` after a successful build: check Vercel framework preset and output
  settings. ERP must be `Next.js`, not `Other`.
- `/login` returns `500`: check required Supabase production env vars.
- `erp.visualsquare.com/` shows the marketing homepage: host-based ERP root
  routing is missing or not deployed.
