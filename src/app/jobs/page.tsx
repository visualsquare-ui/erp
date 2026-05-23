import { AppShell } from "@/components/app-shell";
import { JobsManagement } from "@/components/jobs-management";
import { PageHeader } from "@/components/page-header";
import { getJobsPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const { user, clients, projects, jobs, setupError } = await getJobsPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/jobs">
      <PageHeader
        eyebrow="Jobs"
        title="Job 관리"
        description="대부분의 작업은 Job 단위로 처리하고, 큰 브랜딩·캠페인만 프로젝트 그룹에 묶습니다."
      />

      {setupError ? (
        <div className="ui-card border-[#d8c2bd] bg-[#fff8f6] p-6">
          <h2 className="font-semibold text-[#8a2f1e]">
            Supabase Jobs SQL 실행 필요
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {setupError}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Supabase SQL Editor에서{" "}
            <code className="font-mono text-xs text-[var(--foreground)]">
              supabase/migrations/202605230002_jobs_first_schema.sql
            </code>{" "}
            파일 내용을 실행하면 Job 저장과 PO Job 선택이 정상 동작합니다.
          </p>
        </div>
      ) : (
        <JobsManagement clients={clients} projects={projects} jobs={jobs} />
      )}
    </AppShell>
  );
}
