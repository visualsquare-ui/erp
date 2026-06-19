import { AppShell } from "@/components/erp/app-shell";
import { LeadManagement } from "@/components/erp/lead-management";
import { PageHeader } from "@/components/erp/page-header";
import { getLeadsPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

type LeadsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const [{ status }, { user, leads, setupError }] = await Promise.all([
    searchParams,
    getLeadsPageData(),
  ]);

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/leads">
      <PageHeader
        eyebrow="Marketing"
        title="리드 파이프라인"
        description="visualsquare.com 문의를 상담, 견적, Job, Invoice 흐름으로 연결합니다."
      />

      {setupError ? (
        <div className="ui-card border-[#d8c2bd] bg-[#fff8f6] p-6">
          <h2 className="font-semibold text-[#8a2f1e]">
            Supabase Marketing Leads SQL 실행 필요
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {setupError}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Supabase SQL Editor에서{" "}
            <code className="font-mono text-xs text-[var(--foreground)]">
              supabase/migrations/202606150001_marketing_leads.sql
            </code>{" "}
            파일 내용을 실행하면 웹사이트 문의 저장과 리드 관리가
            동작합니다.
          </p>
        </div>
      ) : (
        <LeadManagement leads={leads} initialStatus={status ?? "all"} />
      )}
    </AppShell>
  );
}
