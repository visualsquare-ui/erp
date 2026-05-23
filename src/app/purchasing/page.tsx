import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PurchasingManagement } from "@/components/purchasing-management";
import { getPurchasingPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function PurchasingPage() {
  const { user, vendors, clients, projects, purchaseOrders, bills } =
    await getPurchasingPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/purchasing">
      <PageHeader
        eyebrow="AP"
        title="PO / Bill"
        description="인쇄소 발주와 공급사 빌을 분리해 AP 흐름을 추적합니다."
      />

      <PurchasingManagement
        vendors={vendors}
        clients={clients}
        projects={projects}
        purchaseOrders={purchaseOrders}
        bills={bills}
      />
    </AppShell>
  );
}
