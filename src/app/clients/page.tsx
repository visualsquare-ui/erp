import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { createClientAction } from "@/app/actions";
import { toNumber, calculateOutstandingAr } from "@/lib/erp-calculations";
import { getClientsPageData } from "@/lib/erp-data";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { user, clients } = await getClientsPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/clients">
      <PageHeader
        eyebrow="CRM"
        title="고객 관리"
        description="고객 연락처, 프로젝트 수, 매출과 미수금을 한 화면에서 확인합니다."
      />

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form
          action={createClientAction}
          className="space-y-3 border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <h2 className="font-semibold">고객 추가</h2>
          <input className="h-10 w-full border px-3 text-sm" name="company_name" placeholder="Company name" />
          <input className="h-10 w-full border px-3 text-sm" name="name" placeholder="Contact name" required />
          <input className="h-10 w-full border px-3 text-sm" name="email" placeholder="Email" />
          <input className="h-10 w-full border px-3 text-sm" name="phone" placeholder="Phone" />
          <textarea className="min-h-20 w-full border px-3 py-2 text-sm" name="address" placeholder="Address" />
          <textarea className="min-h-20 w-full border px-3 py-2 text-sm" name="memo" placeholder="Memo" />
          <button className="h-10 w-full border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">
            저장
          </button>
        </form>

        <div className="border border-[var(--border)] bg-white">
          {clients.length === 0 ? (
            <EmptyState title="고객 없음" description="첫 고객을 추가하세요." />
          ) : (
            clients.map((client) => {
              const revenue = client.invoices.reduce(
                (sum, invoice) => sum + toNumber(invoice.total),
                0,
              );
              const outstanding = calculateOutstandingAr(
                client.invoices.map((invoice) => ({
                  total: toNumber(invoice.total),
                  paidAmount: toNumber(invoice.paid_amount),
                  status: invoice.status,
                })),
              );

              return (
                <article
                  key={client.id}
                  className="grid gap-4 border-b border-[var(--border)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px]"
                >
                  <div>
                    <h2 className="font-semibold">
                      {client.company_name ?? client.name}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {client.name} · {client.email ?? "no email"} ·{" "}
                      {client.phone ?? "no phone"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {client.memo}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm md:grid-cols-1">
                    <div>
                      <p className="text-xs text-[var(--muted)]">Projects</p>
                      <p className="font-semibold">{client.projects.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted)]">Revenue</p>
                      <p className="font-semibold">{formatCurrency(revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted)]">AR</p>
                      <p className="font-semibold">
                        {formatCurrency(outstanding)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </AppShell>
  );
}
