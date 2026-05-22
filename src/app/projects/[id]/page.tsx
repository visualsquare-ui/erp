import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  createAssetAction,
  createInvoiceAction,
  createProofVersionAction,
  createPurchaseOrderAction,
  createTaskAction,
  createVendorBillAction,
  createWorkOrderAction,
} from "@/app/actions";
import {
  calculateProjectMargin,
  toNumber,
} from "@/lib/erp-calculations";
import { getProjectDetailData } from "@/lib/erp-data";
import { formatCurrency, formatUsDate } from "@/lib/format";
import { getProjectWorkflow } from "@/lib/project-rules";
import { StatusBadge } from "@/components/status-badge";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const data = await getProjectDetailData(id);
  const workflow = getProjectWorkflow(data.project.type);
  const invoiceTotal = data.invoices.reduce(
    (sum, invoice) => sum + toNumber(invoice.total),
    0,
  );
  const billTotal = data.bills.reduce(
    (sum, bill) => sum + toNumber(bill.amount),
    0,
  );
  const margin = calculateProjectMargin({
    invoiceTotal,
    vendorBillTotal: billTotal,
  });

  return (
    <AppShell userEmail={data.user.email ?? "Staff"} activePath="/projects">
      <PageHeader
        eyebrow={data.project.type}
        title={data.project.name}
        description={data.project.description ?? undefined}
        actions={<StatusBadge status={data.project.status} />}
      />

      <section className="mb-6 grid gap-3 md:grid-cols-4">
        <MiniStat label="Client" value={data.project.clients?.company_name ?? data.project.clients?.name ?? "-"} />
        <MiniStat label="Quote" value={formatCurrency(toNumber(data.project.quote_amount))} />
        <MiniStat label="Due" value={data.project.due_date ? formatUsDate(data.project.due_date) : "-"} />
        <MiniStat label="Margin" value={`${formatCurrency(margin.margin)} · ${(margin.marginRate * 100).toFixed(0)}%`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="작업">
          <form action={createTaskAction} className="mb-4 grid gap-2 md:grid-cols-5">
            <input type="hidden" name="project_id" value={data.project.id} />
            <input className="h-10 border px-3 text-sm md:col-span-2" name="title" placeholder="Task title" required />
            <input className="h-10 border px-3 text-sm" name="assignee" placeholder="Assignee" />
            <select className="h-10 border px-3 text-sm" name="status" defaultValue="todo">
              <option value="todo">todo</option>
              <option value="doing">doing</option>
              <option value="review">review</option>
              <option value="done">done</option>
            </select>
            <button className="h-10 border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">추가</button>
          </form>
          <div className="grid gap-2">
            {data.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between border px-3 py-2 text-sm">
                <span>{task.title}</span>
                <span className="text-[var(--muted)]">{task.status}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="작업지시서 · 시안">
          <form action={createWorkOrderAction} className="mb-4 grid gap-2">
            <input type="hidden" name="project_id" value={data.project.id} />
            <textarea className="min-h-16 border px-3 py-2 text-sm" name="spec" placeholder="Spec" />
            <textarea className="min-h-16 border px-3 py-2 text-sm" name="requirements" placeholder="Requirements" />
            <input className="h-10 border px-3 text-sm" name="included_revisions" type="number" defaultValue="3" />
            <button className="h-10 border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">작업지시서 추가</button>
          </form>
          {data.workOrders.map((order) => (
            <article key={order.id} className="mb-3 border p-3 text-sm">
              <p className="font-semibold">Included revisions: {order.included_revisions}</p>
              <p className="mt-1 text-[var(--muted)]">{order.spec}</p>
              <form action={createProofVersionAction} className="mt-3 grid gap-2 md:grid-cols-5">
                <input type="hidden" name="project_id" value={data.project.id} />
                <input type="hidden" name="work_order_id" value={order.id} />
                <input type="hidden" name="included_revisions" value={order.included_revisions} />
                <input className="h-9 border px-2 text-sm" name="version" type="number" placeholder="Version" />
                <input className="h-9 border px-2 text-sm md:col-span-2" name="file_url" placeholder="Proof URL" />
                <label className="flex h-9 items-center gap-2 text-sm"><input name="client_approved" type="checkbox" /> Approved</label>
                <button className="h-9 border bg-white text-sm font-semibold">시안 추가</button>
              </form>
              <div className="mt-3 space-y-2">
                {data.proofs.filter((proof) => proof.work_order_id === order.id).map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between border bg-[var(--surface)] px-2 py-1 text-xs">
                    <span>v{proof.version} {proof.client_approved ? "approved" : "pending"}</span>
                    <span>{proof.is_extra_revision ? "추가 청구 대상" : "포함"}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </Panel>

        <Panel title="결과물 · 파일">
          <form action={createAssetAction} className="mb-4 grid gap-2 md:grid-cols-4">
            <input type="hidden" name="project_id" value={data.project.id} />
            <input className="h-10 border px-3 text-sm" name="title" placeholder="Title" required />
            <select className="h-10 border px-3 text-sm" name="kind" defaultValue="drive_link">
              <option value="result_photo">result_photo</option>
              <option value="final_file">final_file</option>
              <option value="drive_link">drive_link</option>
            </select>
            <input className="h-10 border px-3 text-sm" name="external_url" placeholder="Drive or file URL" />
            <label className="flex h-10 items-center gap-2 text-sm"><input name="is_portfolio" type="checkbox" /> Portfolio</label>
            <button className="h-10 border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white md:col-span-4">결과물 추가</button>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {data.assets.map((asset) => (
              <a key={asset.id} href={asset.external_url ?? asset.storage_url ?? "#"} target="_blank" className="border p-3 text-sm">
                <p className="font-semibold">{asset.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{asset.kind} · {asset.is_portfolio ? "portfolio" : "internal"}</p>
              </a>
            ))}
          </div>
        </Panel>

        <Panel title="인보이스">
          <form action={createInvoiceAction} className="mb-4 grid gap-2 md:grid-cols-4">
            <input type="hidden" name="project_id" value={data.project.id} />
            <input type="hidden" name="client_id" value={data.project.client_id} />
            <input type="hidden" name="return_path" value={`/projects/${data.project.id}`} />
            <input className="h-10 border px-3 text-sm md:col-span-2" name="description" placeholder="Line description" />
            <input className="h-10 border px-3 text-sm" name="unit_price" type="number" step="0.01" placeholder="Amount" />
            <select className="h-10 border px-3 text-sm" name="status" defaultValue="draft"><option value="draft">draft</option><option value="sent">sent</option><option value="paid">paid</option></select>
            <label className="flex h-10 items-center gap-2 text-sm"><input name="is_taxable" type="checkbox" /> Taxable</label>
            <input className="h-10 border px-3 text-sm" name="tax_rate" type="number" step="0.00001" placeholder="0.06625" />
            <button className="h-10 border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white md:col-span-2">인보이스 생성</button>
          </form>
          {data.invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between border-b py-2 text-sm">
              <span>{invoice.invoice_number}</span>
              <span>{formatCurrency(toNumber(invoice.total))}</span>
            </div>
          ))}
        </Panel>

        {workflow.purchaseBills !== "hidden" ? (
          <Panel title={`발주·빌 (${workflow.purchaseBills})`}>
            <form action={createPurchaseOrderAction} className="mb-4 grid gap-2 md:grid-cols-4">
              <input type="hidden" name="project_id" value={data.project.id} />
              <input type="hidden" name="return_path" value={`/projects/${data.project.id}`} />
              <select className="h-10 border px-3 text-sm" name="vendor_id" required>{data.vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select>
              <input className="h-10 border px-3 text-sm" name="po_number" placeholder="PO number" />
              <input className="h-10 border px-3 text-sm" name="amount" type="number" step="0.01" placeholder="Amount" />
              <button className="h-10 border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">PO 추가</button>
            </form>
            <form action={createVendorBillAction} className="mb-4 grid gap-2 md:grid-cols-4">
              <input type="hidden" name="project_id" value={data.project.id} />
              <input type="hidden" name="return_path" value={`/projects/${data.project.id}`} />
              <select className="h-10 border px-3 text-sm" name="vendor_id" required>{data.vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select>
              <input className="h-10 border px-3 text-sm" name="bill_number" placeholder="Bill number" />
              <input className="h-10 border px-3 text-sm" name="amount" type="number" step="0.01" placeholder="Amount" />
              <button className="h-10 border bg-white text-sm font-semibold">빌 추가</button>
            </form>
            {data.bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between border-b py-2 text-sm">
                <span>{bill.vendors?.name ?? bill.bill_number}</span>
                <span>{formatCurrency(toNumber(bill.amount))}</span>
              </div>
            ))}
          </Panel>
        ) : null}
      </section>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--border)] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--border)] bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
