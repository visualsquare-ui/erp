import { AppShell } from "@/components/app-shell";
import { InvoiceManagement } from "@/components/invoice-management";
import { PageHeader } from "@/components/page-header";
import { getInvoicesPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { user, clients, projects, purchaseOrders, invoices } =
    await getInvoicesPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/invoices">
      <PageHeader
        eyebrow="AR"
        title="Invoice"
        description="고객에게 보낼 청구서와 입금 상태를 한 화면에서 관리합니다."
      />

      <InvoiceManagement
        clients={clients}
        projects={projects}
        purchaseOrders={purchaseOrders}
        invoices={invoices}
      />
    </AppShell>
  );
}
