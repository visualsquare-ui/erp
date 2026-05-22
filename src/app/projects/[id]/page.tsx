import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
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
        <MiniStat
          label="Client"
          value={data.project.clients?.company_name ?? data.project.clients?.name ?? "-"}
        />
        <MiniStat
          label="Quote"
          value={formatCurrency(toNumber(data.project.quote_amount))}
        />
        <MiniStat
          label="Due"
          value={data.project.due_date ? formatUsDate(data.project.due_date) : "-"}
        />
        <MiniStat
          label="Margin"
          value={`${formatCurrency(margin.margin)} · ${(margin.marginRate * 100).toFixed(0)}%`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="작업">
          <form action={createTaskAction} className="mb-4 grid gap-3 md:grid-cols-5">
            <input type="hidden" name="project_id" value={data.project.id} />
            <Field label="Task" className="md:col-span-2">
              <input
                className="ui-input"
                name="title"
                placeholder="Design review…"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Assignee">
              <input
                className="ui-input"
                name="assignee"
                placeholder="Jane…"
                autoComplete="name"
              />
            </Field>
            <Field label="Status">
              <select className="ui-input" name="status" defaultValue="todo">
                <option value="todo">todo</option>
                <option value="doing">doing</option>
                <option value="review">review</option>
                <option value="done">done</option>
              </select>
            </Field>
            <button className="ui-button self-end">추가</button>
          </form>
          <div className="grid gap-2">
            {data.tasks.length === 0 ? (
              <EmptyState
                title="작업 없음"
                description="프로젝트 실행 항목을 추가하세요."
              />
            ) : (
              data.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-4 border border-[var(--border)] px-3 py-2 text-sm">
                <span className="min-w-0 break-words">{task.title}</span>
                <span className="text-[var(--muted)]">{task.status}</span>
              </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="작업지시서 · 시안">
          <form action={createWorkOrderAction} className="mb-4 grid gap-3">
            <input type="hidden" name="project_id" value={data.project.id} />
            <Field label="Spec">
              <textarea
                className="ui-input min-h-20"
                name="spec"
                placeholder="Production spec…"
                autoComplete="off"
              />
            </Field>
            <Field label="Requirements">
              <textarea
                className="ui-input min-h-20"
                name="requirements"
                placeholder="Client requirements…"
                autoComplete="off"
              />
            </Field>
            <Field label="Included Revisions">
              <input
                className="ui-input"
                name="included_revisions"
                type="number"
                defaultValue="3"
                inputMode="numeric"
              />
            </Field>
            <button className="ui-button">작업지시서 추가</button>
          </form>
          {data.workOrders.length === 0 ? (
            <EmptyState
              title="작업지시서 없음"
              description="제작 조건과 수정 횟수를 먼저 등록하세요."
            />
          ) : (
            data.workOrders.map((order) => (
            <article key={order.id} className="mb-3 border border-[var(--border)] p-3 text-sm last:mb-0">
              <p className="font-semibold tabular-nums">
                Included revisions: {order.included_revisions}
              </p>
              <p className="mt-1 break-words text-[var(--muted)]">{order.spec}</p>
              <form action={createProofVersionAction} className="mt-3 grid gap-2 md:grid-cols-5">
                <input type="hidden" name="project_id" value={data.project.id} />
                <input type="hidden" name="work_order_id" value={order.id} />
                <input type="hidden" name="included_revisions" value={order.included_revisions} />
                <input
                  className="ui-input min-h-9 px-2"
                  name="version"
                  type="number"
                  placeholder="Version…"
                  inputMode="numeric"
                  aria-label="Proof version"
                />
                <input
                  className="ui-input min-h-9 px-2 md:col-span-2"
                  name="file_url"
                  type="url"
                  placeholder="Proof URL…"
                  autoComplete="off"
                  aria-label="Proof URL"
                />
                <label className="flex min-h-9 items-center gap-2 text-sm">
                  <input name="client_approved" type="checkbox" className="h-4 w-4" />
                  Approved
                </label>
                <button className="ui-button ui-button-secondary min-h-9 px-3">시안 추가</button>
              </form>
              <div className="mt-3 space-y-2">
                {data.proofs.filter((proof) => proof.work_order_id === order.id).map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between gap-3 border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs">
                    <span>v{proof.version} {proof.client_approved ? "approved" : "pending"}</span>
                    <span>{proof.is_extra_revision ? "추가 청구 대상" : "포함"}</span>
                  </div>
                ))}
              </div>
            </article>
            ))
          )}
        </Panel>

        <Panel title="결과물 · 파일">
          <form action={createAssetAction} className="mb-4 grid gap-3 md:grid-cols-4">
            <input type="hidden" name="project_id" value={data.project.id} />
            <Field label="Title">
              <input
                className="ui-input"
                name="title"
                placeholder="Final package…"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Kind">
              <select className="ui-input" name="kind" defaultValue="drive_link">
                <option value="result_photo">result_photo</option>
                <option value="final_file">final_file</option>
                <option value="drive_link">drive_link</option>
              </select>
            </Field>
            <Field label="URL">
              <input
                className="ui-input"
                name="external_url"
                type="url"
                placeholder="https://drive.google.com/…"
                autoComplete="off"
              />
            </Field>
            <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
              <input name="is_portfolio" type="checkbox" className="h-4 w-4" />
              Portfolio
            </label>
            <button className="ui-button md:col-span-4">결과물 추가</button>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {data.assets.length === 0 ? (
              <EmptyState
                title="결과물 없음"
                description="완료 파일이나 드라이브 링크를 추가하세요."
              />
            ) : (
              data.assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.external_url ?? asset.storage_url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="border border-[var(--border)] p-3 text-sm transition-colors hover:border-[var(--coral)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
              >
                <p className="break-words font-semibold">{asset.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {asset.kind} · {asset.is_portfolio ? "portfolio" : "internal"}
                </p>
              </a>
              ))
            )}
          </div>
        </Panel>

        <Panel title="인보이스">
          <form action={createInvoiceAction} className="mb-4 grid gap-3 md:grid-cols-4">
            <input type="hidden" name="project_id" value={data.project.id} />
            <input type="hidden" name="client_id" value={data.project.client_id} />
            <input type="hidden" name="return_path" value={`/projects/${data.project.id}`} />
            <Field label="Description" className="md:col-span-2">
              <input
                className="ui-input"
                name="description"
                placeholder="Design service…"
                autoComplete="off"
              />
            </Field>
            <Field label="Amount">
              <input
                className="ui-input"
                name="unit_price"
                type="number"
                step="0.01"
                placeholder="1200.00…"
                inputMode="decimal"
              />
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
            <button className="ui-button md:col-span-2">인보이스 생성</button>
          </form>
          {data.invoices.length === 0 ? (
            <EmptyState
              title="인보이스 없음"
              description="이 프로젝트의 청구 내역을 생성하세요."
            />
          ) : (
            data.invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-2 text-sm last:border-b-0">
              <span className="min-w-0 break-words">{invoice.invoice_number}</span>
              <span className="shrink-0 tabular-nums">{formatCurrency(toNumber(invoice.total))}</span>
            </div>
            ))
          )}
        </Panel>

        {workflow.purchaseBills !== "hidden" ? (
          <Panel title={`발주·빌 (${workflow.purchaseBills})`}>
            <form action={createPurchaseOrderAction} className="mb-4 grid gap-3 md:grid-cols-4">
              <input type="hidden" name="project_id" value={data.project.id} />
              <input type="hidden" name="return_path" value={`/projects/${data.project.id}`} />
              <Field label="Vendor">
                <select className="ui-input" name="vendor_id" required>
                  <option value="">Vendor</option>
                  {data.vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="PO Number">
                <input className="ui-input" name="po_number" placeholder="PO-1001…" autoComplete="off" />
              </Field>
              <Field label="Amount">
                <input className="ui-input" name="amount" type="number" step="0.01" placeholder="850.00…" inputMode="decimal" />
              </Field>
              <button className="ui-button self-end">PO 추가</button>
            </form>
            <form action={createVendorBillAction} className="mb-4 grid gap-3 md:grid-cols-4">
              <input type="hidden" name="project_id" value={data.project.id} />
              <input type="hidden" name="return_path" value={`/projects/${data.project.id}`} />
              <Field label="Vendor">
                <select className="ui-input" name="vendor_id" required>
                  <option value="">Vendor</option>
                  {data.vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Bill Number">
                <input className="ui-input" name="bill_number" placeholder="INV-2001…" autoComplete="off" />
              </Field>
              <Field label="Amount">
                <input className="ui-input" name="amount" type="number" step="0.01" placeholder="850.00…" inputMode="decimal" />
              </Field>
              <button className="ui-button ui-button-secondary self-end">빌 추가</button>
            </form>
            {data.bills.length === 0 ? (
              <EmptyState
                title="발주·빌 없음"
                description="외주 비용이 필요한 프로젝트에서 비용을 추적하세요."
              />
            ) : (
              data.bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-2 text-sm last:border-b-0">
                <span className="min-w-0 break-words">{bill.vendors?.name ?? bill.bill_number}</span>
                <span className="shrink-0 tabular-nums">{formatCurrency(toNumber(bill.amount))}</span>
              </div>
              ))
            )}
          </Panel>
        ) : null}
      </section>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-card p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ui-card p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 space-y-1.5 ${className}`}>
      <span className="ui-label">{label}</span>
      {children}
    </label>
  );
}
