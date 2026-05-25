import { AppShell } from "@/components/erp/app-shell";
import { PageHeader } from "@/components/erp/page-header";
import { ProjectTable } from "@/components/erp/project-table";
import { createProjectAction } from "@/app/(erp)/actions";
import { getProjectsPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { user, clients, projects } = await getProjectsPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/projects">
      <PageHeader
        eyebrow="Project Groups"
        title="프로젝트 그룹"
        description="브랜딩이나 캠페인처럼 여러 Job을 묶어야 할 때만 사용하는 선택적 그룹입니다."
      />

      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <form action={createProjectAction} className="ui-panel space-y-4">
          <h2 className="text-sm font-semibold">프로젝트 그룹 추가</h2>
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
          <Field label="Name">
            <input className="ui-input" name="name" placeholder="Menu redesign…" autoComplete="off" required />
          </Field>
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <input className="ui-input" name="start_date" type="date" autoComplete="off" />
            </Field>
            <Field label="Due">
              <input className="ui-input" name="due_date" type="date" autoComplete="off" />
            </Field>
          </div>
          <Field label="Quote">
            <input className="ui-input" name="quote_amount" type="number" step="0.01" placeholder="4500.00…" inputMode="decimal" />
          </Field>
          <Field label="Description">
            <textarea className="ui-input min-h-20" name="description" placeholder="Scope and delivery notes…" autoComplete="off" />
          </Field>
          <button className="ui-button w-full">
            저장
          </button>
        </form>

        <ProjectTable projects={projects} />
      </section>
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
