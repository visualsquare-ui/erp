import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PurchasingManagement } from "@/components/purchasing-management";
import { getPurchasingPageData } from "@/lib/erp-data";

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

      <PurchasingManagement
        vendors={vendors}
        projects={projects}
        purchaseOrders={purchaseOrders}
        bills={bills}
      />
    </AppShell>
  );
}
