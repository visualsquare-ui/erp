import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { VendorManagement } from "@/components/vendor-management";
import { getVendorsPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const { user, vendors } = await getVendorsPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/vendors">
      <PageHeader
        eyebrow="AP MASTER"
        title="벤더 관리"
        description="인쇄소와 외주 거래처 정보를 PO와 빌에서 재사용할 수 있게 관리합니다."
      />

      <VendorManagement vendors={vendors} />
    </AppShell>
  );
}
