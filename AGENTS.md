# Codex Workspace Notes

- For the `aeo-project`, the canonical working directory is `/Users/jaeminkoo/workspace/aeo-project`.
- If a session starts in a temporary Codex worktree for `aeo-project`, switch command workdirs to `/Users/jaeminkoo/workspace/aeo-project` unless the user explicitly asks otherwise.

## Visual Square Project Startup

- For this project, run `npm run preflight` before GitHub, Vercel, commit, push, or deployment work.
- `npm run preflight` delegates to the global preflight registry at `~/.codex/project-preflight.json`.
- Do not push Visual Square work unless the GitHub active account is `visualsquare-ui`.
- Do not push Visual Square work as `jaeminkoo-ui`, `simplin-ai`, `seenutech-ai`, or any other GitHub account.
- Use `jkoo@visualsquare.com` as the git author email for Visual Square commits.
- Use `visualsquare-ui/erp` as the ERP GitHub remote.
- Use Vercel scope `visual-square-s-projects` and project `erp` for ERP deploys.
