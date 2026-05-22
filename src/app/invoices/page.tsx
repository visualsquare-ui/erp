import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { createInvoiceAction } from "@/app/actions";
import { toNumber } from "@/lib/erp-calculations";
import { getInvoicesPageData } from "@/lib/erp-data";
import { formatCurrency, formatUsDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { user, projects, invoices } = await getInvoicesPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/invoices">
      <PageHeader
        eyebrow="AR"
        title="인보이스"
        description="고객에게 받을 돈과 입금 상태를 추적합니다."
      />

      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <form action={createInvoiceAction} className="ui-panel space-y-4">
          <h2 className="text-sm font-semibold">인보이스 생성</h2>
          <Field label="Project">
            <select className="ui-input" name="project_id" required>
              <option value="">Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Bill To">
            <select className="ui-input" name="client_id" required>
              <option value="">Client</option>
              {projects.map((project) => (
                <option key={project.id} value={project.client_id}>
                  {project.clients?.company_name ?? project.clients?.name} (
                  {project.name})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <input
              className="ui-input"
              name="description"
              placeholder="Design service…"
              autoComplete="off"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity">
              <input
                className="ui-input"
                name="quantity"
                type="number"
                step="0.01"
                defaultValue="1"
                inputMode="decimal"
              />
            </Field>
            <Field label="Unit Price">
              <input
                className="ui-input"
                name="unit_price"
                type="number"
                step="0.01"
                placeholder="1200.00…"
                inputMode="decimal"
              />
            </Field>
          </div>
          <Field label="Terms">
            <select className="ui-input" name="terms" defaultValue="net_30">
              <option value="net_30">Net 30</option>
              <option value="net_15">Net 15</option>
              <option value="due_on_receipt">Due on receipt</option>
            </select>
          </Field>
          <Field label="Status">
            <select className="ui-input" name="status" defaultValue="draft">
              <option value="draft">draft</option>
              <option value="sent">sent</option>
              <option value="paid">paid</option>
            </select>
          </Field>
          <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
            <input name="is_taxable" type="checkbox" className="h-4 w-4" />
            Taxable
          </label>
          <Field label="Tax Rate">
            <input
              className="ui-input"
              name="tax_rate"
              type="number"
              step="0.00001"
              placeholder="0.06625…"
              inputMode="decimal"
            />
          </Field>
          <button className="ui-button w-full">저장</button>
        </form>

        <div className="ui-card overflow-hidden">
          {invoices.length === 0 ? (
            <EmptyState
              title="인보이스 없음"
              description="프로젝트를 선택해 첫 인보이스를 생성하세요."
            />
          ) : (
            invoices.map((invoice) => (
              <article
                key={invoice.id}
                className="grid gap-4 border-b border-[var(--border)] p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px]"
              >
                <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="break-words font-semibold">
                    {invoice.invoice_number}
                  </h2>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="mt-1 break-words text-sm text-[var(--muted)]">
                  {invoice.clients?.company_name ?? invoice.clients?.name} ·{" "}
                  {invoice.projects?.name}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Issue {formatUsDate(invoice.issue_date)} · Due{" "}
                  {formatUsDate(invoice.due_date)}
                </p>
              </div>
              <div className="space-y-1 text-sm tabular-nums">
                <p className="flex justify-between gap-3">
                  <span className="text-[var(--muted)]">Subtotal</span>
                  <strong>{formatCurrency(toNumber(invoice.subtotal))}</strong>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-[var(--muted)]">Tax</span>
                  <strong>{formatCurrency(toNumber(invoice.tax))}</strong>
                </p>
                <p className="mt-2 flex justify-between gap-3 border-t border-[var(--border)] pt-2">
                  <span>Total</span>
                  <strong>{formatCurrency(toNumber(invoice.total))}</strong>
                </p>
              </div>
            </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="ui-label">{label}</span>
      {children}
    </label>
  );
}
