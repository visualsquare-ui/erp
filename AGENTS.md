# Codex Workspace Notes

- For the `aeo-project`, the canonical working directory is `/Users/jaeminkoo/workspace/aeo-project`.
- If a session starts in a temporary Codex worktree for `aeo-project`, switch command workdirs to `/Users/jaeminkoo/workspace/aeo-project` unless the user explicitly asks otherwise.

## Visual Square Project Startup

- This repository is the ERP application for `erp.visualsquare.com`.
- Public marketing-site work belongs in `/Users/jaeminkoo/Workspace/visualsquare-site`, not here.
- If a task mentions homepage, SEO pages, blog, service landing pages, ads landing pages, public contact form styling, or `visualsquare.com`, stop and switch to `/Users/jaeminkoo/Workspace/visualsquare-site`.
- Supabase schema, migrations, clients, jobs, invoices, vendors, purchasing, staff auth, and lead management belong here.
- The ERP Supabase project is `visualsquare-erp`; do not link this repo to the public-site/n8n Supabase project.
- For this project, run `npm run preflight` before GitHub, Vercel, commit, push, or deployment work.
- `npm run preflight` delegates to the global preflight registry at `~/.codex/project-preflight.json`.
- Do not push Visual Square work unless the GitHub active account is `visualsquare-ui`.
- Do not push Visual Square work as `jaeminkoo-ui`, `simplin-ai`, `seenutech-ai`, or any other GitHub account.
- Visual Square commits must use the exact git author `Visual Square <jkoo@visualsquare.com>`.
- Do not use personal author identities such as `Jaemin Koo <jaeminkoo@gmail.com>` for any Visual Square push.
- Public site work must be done from `/Users/jaeminkoo/Workspace/visualsquare-site` with the `visualsquare-ui/visualsquare-site` remote.
- ERP work must be done from `/Users/jaeminkoo/Workspace/visualsquare` with the `visualsquare-ui/erp` remote.
- If the repo path, remote, author, or Vercel target does not match the intended surface, stop instead of "fixing it later".
- Use `visualsquare-ui/erp` as the ERP GitHub remote.
- Use Vercel scope `visual-square-s-projects` and project `erp` for ERP deploys.
