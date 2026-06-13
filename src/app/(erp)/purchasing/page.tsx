import { AppShell } from "@/components/erp/app-shell";
import { PageHeader } from "@/components/erp/page-header";
import { PurchasingManagement } from "@/components/erp/purchasing-management";
import { getPurchasingPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function PurchasingPage() {
  const { user, clients, vendors, jobs, projects, purchaseOrders, bills, accounts, jobsSetupError } =
    await getPurchasingPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/purchasing">
      <PageHeader
        eyebrow="AP"
        title="PO / Bill"
        description="인쇄소 발주와 공급사 빌을 분리해 AP 흐름을 추적합니다."
      />

      <PurchasingManagement
        clients={clients}
        vendors={vendors}
        jobs={jobs}
        projects={projects}
        purchaseOrders={purchaseOrders}
        bills={bills}
        accounts={accounts}
        jobsSetupError={jobsSetupError}
      />
    </AppShell>
  );
}
