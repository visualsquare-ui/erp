import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  createPurchaseOrderAction,
  createVendorAction,
  createVendorBillAction,
} from "@/app/actions";
import { toNumber } from "@/lib/erp-calculations";
import { getPurchasingPageData } from "@/lib/erp-data";
import { formatCurrency, formatUsDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PurchasingPage() {
  const { user, vendors, projects, purchaseOrders, bills } =
    await getPurchasingPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/purchasing">
      <PageHeader
        eyebrow="AP"
        title="발주·빌"
        description="인쇄소 발주와 받은 빌을 연결해 줄 돈을 추적합니다."
      />

      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <form action={createVendorAction} className="ui-panel space-y-4">
            <h2 className="text-sm font-semibold">인쇄소 추가</h2>
            <Field label="Vendor">
              <input
                className="ui-input"
                name="name"
                placeholder="Print partner…"
                autoComplete="organization"
                required
              />
            </Field>
            <Field label="Contact">
              <input
                className="ui-input"
                name="contact_person"
                placeholder="Sam Lee…"
                autoComplete="name"
              />
            </Field>
            <Field label="Specialty">
              <input
                className="ui-input"
                name="specialty"
                placeholder="Large format, offset…"
                autoComplete="off"
              />
            </Field>
            <button className="ui-button w-full">저장</button>
          </form>

          <form action={createPurchaseOrderAction} className="ui-panel space-y-4">
            <h2 className="text-sm font-semibold">발주 추가</h2>
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
            <Field label="Vendor">
              <select className="ui-input" name="vendor_id" required>
                <option value="">Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="PO Number">
              <input
                className="ui-input"
                name="po_number"
                placeholder="PO-1001…"
                autoComplete="off"
              />
            </Field>
            <Field label="Amount">
              <input
                className="ui-input"
                name="amount"
                type="number"
                step="0.01"
                placeholder="850.00…"
                inputMode="decimal"
              />
            </Field>
            <button className="ui-button w-full">PO 저장</button>
          </form>

          <form action={createVendorBillAction} className="ui-panel space-y-4">
            <h2 className="text-sm font-semibold">받은 빌 추가</h2>
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
            <Field label="Vendor">
              <select className="ui-input" name="vendor_id" required>
                <option value="">Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bill Number">
              <input
                className="ui-input"
                name="bill_number"
                placeholder="INV-2001…"
                autoComplete="off"
              />
            </Field>
            <Field label="Amount">
              <input
                className="ui-input"
                name="amount"
                type="number"
                step="0.01"
                placeholder="850.00…"
                inputMode="decimal"
              />
            </Field>
            <button className="ui-button ui-button-secondary w-full">
              빌 저장
            </button>
          </form>
        </div>

        <div className="grid gap-6">
          <Panel title="발주">
            {purchaseOrders.length === 0 ? (
              <EmptyState
                title="발주 없음"
                description="프로젝트와 인쇄소를 선택해 첫 PO를 추가하세요."
              />
            ) : (
              purchaseOrders.map((order) => (
                <Row
                  key={order.id}
                  title={order.po_number}
                  meta={`${order.projects?.name} · ${order.vendors?.name}`}
                  amount={formatCurrency(toNumber(order.amount))}
                />
              ))
            )}
          </Panel>
          <Panel title="받은 빌">
            {bills.length === 0 ? (
              <EmptyState
                title="받은 빌 없음"
                description="공급사 빌을 추가하면 미지급금 추적에 반영됩니다."
              />
            ) : (
              bills.map((bill) => (
                <Row
                  key={bill.id}
                  title={bill.bill_number ?? bill.id}
                  meta={`${bill.projects?.name} · ${bill.vendors?.name} · ${
                    bill.due_date ? formatUsDate(bill.due_date) : "-"
                  }`}
                  amount={formatCurrency(toNumber(bill.amount))}
                />
              ))
            )}
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ui-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ title, meta, amount }: { title: string; meta: string; amount: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-3 text-sm last:border-b-0">
      <div className="min-w-0">
        <p className="break-words font-semibold">{title}</p>
        <p className="mt-1 break-words text-xs text-[var(--muted)]">{meta}</p>
      </div>
      <strong className="shrink-0 tabular-nums">{amount}</strong>
    </div>
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
