import { AppShell } from "@/components/erp/app-shell";
import { EstimateManagement } from "@/components/erp/estimate-management";
import { PageHeader } from "@/components/erp/page-header";
import { getEstimatesPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function EstimatesPage() {
  const { user, clients, jobs, estimates, schemaError } =
    await getEstimatesPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/estimates">
      <PageHeader
        eyebrow="Sales"
        title="Estimate"
        description="고객에게 보낼 견적서를 작성하고 발송, 수락 여부를 한 화면에서 관리합니다."
      />

      <EstimateManagement
        clients={clients}
        jobs={jobs}
        estimates={estimates}
        schemaError={schemaError}
      />
    </AppShell>
  );
}
