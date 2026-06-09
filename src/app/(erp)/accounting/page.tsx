import { AccountingManagement } from "@/components/erp/accounting-management";
import { AppShell } from "@/components/erp/app-shell";
import { EmptyState } from "@/components/erp/empty-state";
import { PageHeader } from "@/components/erp/page-header";
import { getAccountingPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const { user, setupError, accounts, transactions, clients, vendors, invoices, bills } =
    await getAccountingPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/accounting">
      <PageHeader
        eyebrow="ACCOUNTING"
        title="어카운팅"
        description="은행 계좌 잔액과 입출금, 경비 지출 기록을 한 곳에서 관리합니다."
      />

      {setupError ? (
        <EmptyState title="어카운팅 설정 필요" description={setupError} />
      ) : (
        <AccountingManagement
          accounts={accounts}
          transactions={transactions}
          clients={clients}
          vendors={vendors}
          invoices={invoices}
          bills={bills}
        />
      )}
    </AppShell>
  );
}
