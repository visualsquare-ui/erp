# Visual Square ERP Handoff

Last updated: 2026-05-25

## Workspace

- Project path: `/Users/jaeminkoo/Workspace/visualsquare`
- App: Next.js 16 / React 19 / Supabase / Resend / PDFKit / Stripe
- Local URL: `http://localhost:3000`
- Current branch: `main`
- GitHub remote: `visualsquare-ui/visualsquare-site`
- Working tree at handoff time: clean after the latest handoff commit/push

## Commands

```bash
npm run dev
npm test
npm run lint
npm run build
npm run sql:check
```

## Environment

Do not paste secret values into chat. Required/known `.env.local` keys:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_REPLY_TO_EMAIL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=
NEXT_PUBLIC_ZELLE_PAYMENT_LINK=
NEXT_PUBLIC_VENMO_PAYMENT_LINK=
```

Stripe Checkout Sessions are implemented per invoice. `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` remains only as a fallback when no invoice id is available. Set the Stripe webhook endpoint to:

```text
https://<erp-domain>/api/stripe/webhook
```

Listen for:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
```

The webhook marks matching invoices as `paid` using `client_reference_id` / `metadata.invoice_id`.

## Recent Verification

Most recent checks passed on 2026-05-25:

- `npm test`: 18 test files / 54 tests passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm exec eslint src/app/industries/page.tsx`: passed after shortening the Industries hero title
- `npm test -- src/content/marketing-content.test.ts`: passed after Korean content coverage updates

## Supabase Migrations

Migration files in `supabase/migrations`:

- `202605220001_initial_schema.sql`
- `202605220002_remove_seed_data.sql`
- `202605230001_vendor_bill_storage.sql`
- `202605230002_jobs_first_schema.sql`
- `202605230003_invoice_po_links.sql`
- `202605230004_optional_invoice_project.sql`
- `202605240001_stripe_invoice_payments.sql`

Important SQL that was recently needed:

```sql
alter table public.invoice_items
add column if not exists purchase_order_id uuid references public.purchase_orders(id) on delete set null;

create index if not exists invoice_items_purchase_order_id_idx
on public.invoice_items(purchase_order_id);

notify pgrst, 'reload schema';
```

For optional invoice projects, run this in Supabase if not already applied:

```sql
alter table public.invoices
alter column project_id drop not null;

notify pgrst, 'reload schema';
```

## Major Completed Work

### ERP Shell / Design

- Built internal ERP UI using Visual Square brand assets from `assets`.
- Side nav order:
  - Dashboard
  - Clients
  - Vendors
  - Jobs
  - PO / Bill
  - Invoice
  - Projects
  - Portfolio
- Updated visual direction to match Visual Square public website: restrained editorial layout, serif logo, coral accent, thin borders, minimal cards.
- Removed visible “Supabase connected” status block from dashboard.

### Auth / Supabase

- Supabase auth is working.
- Real DB is connected through `.env.local`.
- Dummy/hardcoded data was removed in favor of Supabase data.

### Clients

- Client page now uses list-first workflow.
- Add/edit/delete supported.
- Client detail expands to show recent Jobs.
- Search added.
- Address form split into:
  - Street
  - Street 1
  - City
  - State
  - Zip Code
- Address suggestion endpoint added.
- Phone auto-formatting added: `(XXX) XXX-XXXX`.
- Client list contact display split into Contact / Email / Phone / Address lines.

### Vendors

- Vendor menu added as its own section.
- Vendor CRUD exists.
- Purchasing flows now reference vendors separately.

### Jobs / Projects

- Shifted operational model toward Jobs-first.
- Projects are optional groupings for larger campaigns/branding work.
- Jobs can exist with or without a Project.
- Jobs list/add/edit/delete implemented.
- PO items can be tied to Jobs but are not blocked if no Job is selected.

### PO / Bill

- PO and Bill were separated from Invoice into PO / Bill page.
- List-first workflow implemented.
- Add/edit/delete controls added.
- PO delete uses soft-delete/canceled status with Undo support.
- PO supports multiple line items:
  - Client
  - Job
  - Item
  - Unit Price
  - Qty
  - Total
- PO date added.
- Bill can be created from a PO and prefilled from PO amount/items/vendor/project.
- Bill file upload supports PDF/JPG through Supabase Storage.
- Bill Paid/Unpaid control added.
- Bill row action layout aligned with PO rows.

### Numbering

PO number display/generation:

- Format: `PO-MMDDYYYY-XX`
- Example: `PO-05232026-01`
- Based on `order_date`
- Old `PO-177...` / `PO-20260511` style values are displayed in the new generated format.
- New PO saves generated number automatically.

Bill number display/generation:

- If vendor-provided Bill Number is present and not legacy internal format, keep it.
- If empty or legacy `MMDDYY-N` format, display generated number.
- Format: `<VENDOR4>-MMDDYYYY-XX`
- Example: `BDOP-05232026-01`
- New Bill saves generated number automatically if field is empty.

Invoice numbering:

- Current format: `VS-YYYY-0001`
- Current generation is count-based in `src/app/actions.ts`.
- Needs improvement later to per-year sequence and stronger collision protection.

### Invoices

- Invoice page is list-first.
- Add/edit/delete supported.
- Invoice can import one or multiple POs into invoice line items.
- Invoice item schema includes:
  - `purchase_order_id`
  - `job_id`
- Invoice PDF preview route added:
  - `src/app/api/invoices/[id]/pdf/route.ts`
- Invoice preview modal added.
- Resend email send endpoint added:
  - `src/app/api/invoices/[id]/send/route.ts`
- PDF generation uses PDFKit and actual Visual Square logo.
- PDF was fixed to stay on one page.
- Payment options are currently shown in preview/PDF/email from static env links.
- `Bill To` now loads all clients from `clients`, not only clients with Projects.
- Project is now optional for Invoice:
  - UI says `No project`
  - server writes `project_id: null`
  - DB migration required: `202605230004_optional_invoice_project.sql`

### Public Landing Page

- Existing Visual Square public site files are in root:
  - `index.html`
  - `style.css`
  - `script.js`
  - `logo.png`
  - `logo-white.png`
- Landing page typography issue with descenders clipped in “System” / “Beautifully” was fixed.
- The `/` route now renders the legacy public home markup from `index.html` through Next so the previous high-quality home design stays intact.
- Home still loads `/home/style.css` and `/home/script.js`; keep future home refinements aligned with those files unless the whole home page is deliberately rebuilt.
- The black loader screen was removed/disabled so the site opens directly into the home experience.
- Home header regains the white background once the user scrolls, so menu text remains readable over portfolio imagery.
- Recommended production subdomains:
  - Internal ERP: `erp.visualsquare.com`
  - Future client portal: `clients.visualsquare.com`

### Public Marketing Pages

- Added Next routes for public marketing content:
  - `/industries`
  - `/industries/[slug]`
  - `/blog`
  - `/blog/[slug]`
- Added shared marketing shell/header/footer:
  - `src/components/marketing-shell.tsx`
  - `src/components/marketing-language-toggle.tsx`
  - `src/components/marketing-visuals.tsx`
- Header was unified across home, industries, blog, and article pages:
  - Logo links to `/`
  - Menu order: `Services`, `Portfolio`, `About`, divider, `Industries`, `Blog`, `Get in Touch`, language toggle
  - `Services`, `Portfolio`, and `About` are home-page anchors
  - `Industries` and `Blog` are separate pages
- Marketing typography was aligned with the home screen font set:
  - Display headings use the same serif display direction as home
  - Navigation/body UI use the same sans direction as home
  - Avoid adding extra font families unless the whole identity system changes
- Language toggle now translates marketing page content, not only the navigation:
  - Korean copy exists for industry cards, industry detail pages, process steps, footer, and blog/article content
  - Coverage test: `src/content/marketing-content.test.ts`
- Blog was simplified from a lecture-style page into a clearer article index:
  - Hero title shortened to `Design notes, not lectures.`
  - Latest article card is visually identifiable as the blog entry
  - Article page title shortened to `Med Spa Launch Checklist`
  - FAQ was removed from the article layout
  - A relevant generated hero image was added at the top of the article
  - Footer includes Visual Square logo
- Industries hero title was shortened:
  - English: `Launch-ready design systems.`
  - Korean: `런칭 준비 디자인 시스템.`
- Marketing images live under `public/marketing`.

### Public Content Data

- Main content source: `src/content/marketing-content.ts`
- Blog and industry routes should read from this shared data instead of duplicating page copy.
- Korean fields are stored alongside English fields; when adding content, add both languages and update the coverage test.

## Recent Commits

Most recent commits:

```text
fe8b93f fix: allow invoices without projects
714b998 fix: show all clients in invoice bill to
edb4cfd fix: surface invoice item schema migration hint
f81d777 fix: normalize legacy bill numbers
c1ea3c5 feat: generate purchase order numbers
e59fd5b feat: generate vendor bill numbers
83d586c fix: keep invoice pdf on one page
9af0964 feat: add invoice pdf preview and payment links
3c9d484 feat: preview and send branded invoices
6418b95 style: align bill row actions with purchase orders
d8993c1 feat: add paid unpaid bill status controls
72538f2 feat: import purchase orders into invoices
2101904 fix: normalize vendor bill uploads
2695653 feat: add job edit and delete controls
5673a26 fix: make PO jobs optional and show setup errors
```

## Important Files

- `src/app/actions.ts`: main server actions for CRUD and save logic.
- `src/lib/erp-data.ts`: Supabase page data loaders.
- `src/components/app-shell.tsx`: global ERP shell/nav.
- `src/components/client-create-form.tsx`: client list/add/edit UI.
- `src/components/jobs-management.tsx`: Jobs page.
- `src/components/job-table.tsx`: Jobs table with edit/delete.
- `src/components/purchasing-management.tsx`: PO / Bill UI.
- `src/components/invoice-management.tsx`: Invoice UI, preview, PO import.
- `src/lib/document-numbering.ts`: PO/Bill numbering and display normalization.
- `src/lib/invoice-document.ts`: invoice email HTML and invoice line item model.
- `src/lib/invoice-pdf.ts`: PDFKit invoice PDF generation.
- `src/lib/invoice-server.ts`: server-side invoice fetch for PDF/send endpoints.
- `src/lib/payment-links.ts`: static payment link env parsing.
- `src/lib/supabase-schema-errors.ts`: schema migration hint messages.

## Known Issues / Next Work

1. Stripe payment should be implemented properly:
   - Add `STRIPE_SECRET_KEY`
   - Add `STRIPE_WEBHOOK_SECRET`
   - Add `NEXT_PUBLIC_APP_URL`
   - Create `/pay/[invoiceId]` or API route to create Checkout Session.
   - Use invoice id/number/total/client email as metadata.
   - Add webhook for `checkout.session.completed` to mark invoice Paid.

2. Invoice numbering should be made more robust:
   - Current count-based `VS-YYYY-0001` can collide if invoices are deleted or created concurrently.
   - Better: DB sequence/table or query max for current year and lock/unique retry.

3. Supabase migrations are manual right now:
   - If a new session sees schema cache errors, check `supabase/migrations`.
   - Run missing SQL in Supabase SQL Editor and include `notify pgrst, 'reload schema';`.

4. Design needs continued refinement:
   - User likes the overall direction but has repeatedly noted form/button spacing and sizing must match the brand.
   - Keep UI restrained, minimal, thin bordered, coral accent, no oversized generic buttons.

5. Client portal is future work:
   - Suggested subdomain: `clients.visualsquare.com`.

6. Deployment:
   - User mentioned Vercel, but production deployment/domain setup is not completed in this handoff.
   - Need GitHub remote/Vercel settings if moving to production.

## Notes for Next Agent

- Respond in Korean unless user asks otherwise.
- Use `apply_patch` for file edits.
- Do not expose `.env.local` secret values.
- The user is sensitive to visual quality. Make small, coherent UI changes and verify with browser/screenshots when touching UI.
- The current thread became slow; continue from this file rather than asking the user to repeat context.
