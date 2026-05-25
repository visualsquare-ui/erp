# Deployment Guide

## Vercel Setup

This project deploys automatically to Vercel on push to `main`.

- **Production URL**: https://visualsquare.com
- **Vercel Project**: visualsquare-ui / visualsquare-site
- **Plan**: Hobby

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

## Deployment Flow

1. Push to `main` → Vercel auto-deploys
2. If blocked, check commit author email (see above)
3. If manually needed: Vercel Dashboard → Deployments → Promote to Production
