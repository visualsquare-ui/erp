import { AppShell } from "@/components/erp/app-shell";
import { ClientManagement } from "@/components/erp/client-create-form";
import { PageHeader } from "@/components/erp/page-header";
import { getClientsPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { user, clients, jobs, invoices, purchaseOrders } =
    await getClientsPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/clients">
      <PageHeader
        eyebrow="CRM"
        title="고객 관리"
        description="고객 연락처와 최근 Job 수익성을 검색하고 확장해서 확인합니다."
      />

      <ClientManagement
        clients={clients}
        jobs={jobs}
        invoices={invoices}
        purchaseOrders={purchaseOrders}
      />
    </AppShell>
  );
}
