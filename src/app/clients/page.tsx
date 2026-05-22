import { AppShell } from "@/components/app-shell";
import { ClientManagement } from "@/components/client-create-form";
import { PageHeader } from "@/components/page-header";
import { getClientsPageData } from "@/lib/erp-data";

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

      <ClientManagement clients={clients} />
    </AppShell>
  );
}
