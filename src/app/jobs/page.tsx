import { createJobAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { JobTable } from "@/components/job-table";
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
      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <form action={createJobAction} className="ui-panel space-y-4">
          <h2 className="text-sm font-semibold">Job 추가</h2>
          <Field label="Client">
            <select className="ui-input" name="client_id" required>
              <option value="">Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name ?? client.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Project Group">
            <select className="ui-input" name="project_id">
              <option value="">No project group</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Job Name">
            <input
              className="ui-input"
              name="name"
              placeholder="Window decal, menu board..."
              autoComplete="off"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className="ui-input" name="type" defaultValue="print">
                <option value="print">print</option>
                <option value="web">web</option>
                <option value="app">app</option>
                <option value="logo">logo</option>
                <option value="branding">branding</option>
              </select>
            </Field>
            <Field label="Status">
              <select className="ui-input" name="status" defaultValue="quote">
                <option value="quote">quote</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
                <option value="on_hold">on_hold</option>
                <option value="canceled">canceled</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <input
                className="ui-input"
                name="start_date"
                type="date"
                autoComplete="off"
              />
            </Field>
            <Field label="Due">
              <input
                className="ui-input"
                name="due_date"
                type="date"
                autoComplete="off"
              />
            </Field>
          </div>
          <Field label="Quote">
            <input
              className="ui-input"
              name="quote_amount"
              type="number"
              step="0.01"
              placeholder="850.00..."
              inputMode="decimal"
            />
          </Field>
          <Field label="Description">
            <textarea
              className="ui-input min-h-20"
              name="description"
              placeholder="Scope and delivery notes..."
              autoComplete="off"
            />
          </Field>
          <button className="ui-button w-full">저장</button>
        </form>

        <JobTable jobs={jobs} />
      </section>
      )}
    </AppShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="ui-label">{label}</span>
      {children}
    </label>
  );
}
