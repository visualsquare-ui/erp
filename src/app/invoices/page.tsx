import { AppShell } from "@/components/app-shell";
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

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form action={createInvoiceAction} className="space-y-3 border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="font-semibold">인보이스 생성</h2>
          <select className="h-10 w-full border px-3 text-sm" name="project_id" required>
            <option value="">Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select className="h-10 w-full border px-3 text-sm" name="client_id" required>
            <option value="">Bill to client</option>
            {projects.map((project) => (
              <option key={project.id} value={project.client_id}>
                {project.clients?.company_name ?? project.clients?.name} ({project.name})
              </option>
            ))}
          </select>
          <input className="h-10 w-full border px-3 text-sm" name="description" placeholder="Description" />
          <input className="h-10 w-full border px-3 text-sm" name="quantity" type="number" step="0.01" defaultValue="1" />
          <input className="h-10 w-full border px-3 text-sm" name="unit_price" type="number" step="0.01" placeholder="Unit price" />
          <select className="h-10 w-full border px-3 text-sm" name="terms" defaultValue="net_30">
            <option value="net_30">Net 30</option>
            <option value="net_15">Net 15</option>
            <option value="due_on_receipt">Due on receipt</option>
          </select>
          <select className="h-10 w-full border px-3 text-sm" name="status" defaultValue="draft">
            <option value="draft">draft</option>
            <option value="sent">sent</option>
            <option value="paid">paid</option>
          </select>
          <label className="flex items-center gap-2 text-sm"><input name="is_taxable" type="checkbox" /> Taxable</label>
          <input className="h-10 w-full border px-3 text-sm" name="tax_rate" type="number" step="0.00001" placeholder="NJ 0.06625" />
          <button className="h-10 w-full border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">저장</button>
        </form>

        <div className="border border-[var(--border)] bg-white">
          {invoices.map((invoice) => (
            <article key={invoice.id} className="grid gap-3 border-b border-[var(--border)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">{invoice.invoice_number}</h2>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {invoice.clients?.company_name ?? invoice.clients?.name} · {invoice.projects?.name}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Issue {formatUsDate(invoice.issue_date)} · Due {formatUsDate(invoice.due_date)}
                </p>
              </div>
              <div className="text-sm">
                <p className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(toNumber(invoice.subtotal))}</strong></p>
                <p className="flex justify-between"><span>Tax</span><strong>{formatCurrency(toNumber(invoice.tax))}</strong></p>
                <p className="mt-2 flex justify-between border-t pt-2"><span>Total</span><strong>{formatCurrency(toNumber(invoice.total))}</strong></p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
