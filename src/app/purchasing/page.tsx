import { AppShell } from "@/components/app-shell";
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

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <form action={createVendorAction} className="space-y-2 border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold">인쇄소 추가</h2>
            <input className="h-10 w-full border px-3 text-sm" name="name" placeholder="Vendor name" required />
            <input className="h-10 w-full border px-3 text-sm" name="contact_person" placeholder="Contact" />
            <input className="h-10 w-full border px-3 text-sm" name="specialty" placeholder="Specialty" />
            <button className="h-10 w-full border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">저장</button>
          </form>

          <form action={createPurchaseOrderAction} className="space-y-2 border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold">발주 추가</h2>
            <select className="h-10 w-full border px-3 text-sm" name="project_id" required>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
            <select className="h-10 w-full border px-3 text-sm" name="vendor_id" required>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select>
            <input className="h-10 w-full border px-3 text-sm" name="po_number" placeholder="PO number" />
            <input className="h-10 w-full border px-3 text-sm" name="amount" type="number" step="0.01" placeholder="Amount" />
            <button className="h-10 w-full border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">PO 저장</button>
          </form>

          <form action={createVendorBillAction} className="space-y-2 border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold">받은 빌 추가</h2>
            <select className="h-10 w-full border px-3 text-sm" name="project_id" required>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
            <select className="h-10 w-full border px-3 text-sm" name="vendor_id" required>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select>
            <input className="h-10 w-full border px-3 text-sm" name="bill_number" placeholder="Bill number" />
            <input className="h-10 w-full border px-3 text-sm" name="amount" type="number" step="0.01" placeholder="Amount" />
            <button className="h-10 w-full border bg-white text-sm font-semibold">빌 저장</button>
          </form>
        </div>

        <div className="grid gap-6">
          <Panel title="발주">
            {purchaseOrders.map((order) => (
              <Row key={order.id} title={order.po_number} meta={`${order.projects?.name} · ${order.vendors?.name}`} amount={formatCurrency(toNumber(order.amount))} />
            ))}
          </Panel>
          <Panel title="받은 빌">
            {bills.map((bill) => (
              <Row key={bill.id} title={bill.bill_number ?? bill.id} meta={`${bill.projects?.name} · ${bill.vendors?.name} · ${bill.due_date ? formatUsDate(bill.due_date) : "-"}`} amount={formatCurrency(toNumber(bill.amount))} />
            ))}
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-[var(--border)] bg-white p-4"><h2 className="mb-3 font-semibold">{title}</h2>{children}</section>;
}

function Row({ title, meta, amount }: { title: string; meta: string; amount: string }) {
  return <div className="flex items-center justify-between border-b py-3 text-sm last:border-b-0"><div><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-[var(--muted)]">{meta}</p></div><strong>{amount}</strong></div>;
}
