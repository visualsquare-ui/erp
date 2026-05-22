import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ProjectTable } from "@/components/project-table";
import { createProjectAction } from "@/app/actions";
import { getProjectsPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { user, clients, projects } = await getProjectsPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/projects">
      <PageHeader
        eyebrow="Projects"
        title="프로젝트"
        description="고객, 작업, 산출물, 인보이스, 발주·빌이 모이는 허브입니다."
      />

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form action={createProjectAction} className="space-y-3 border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="font-semibold">프로젝트 추가</h2>
          <select className="h-10 w-full border px-3 text-sm" name="client_id" required>
            <option value="">Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name ?? client.name}
              </option>
            ))}
          </select>
          <input className="h-10 w-full border px-3 text-sm" name="name" placeholder="Project name" required />
          <select className="h-10 w-full border px-3 text-sm" name="type" defaultValue="print">
            <option value="print">print</option>
            <option value="web">web</option>
            <option value="app">app</option>
            <option value="logo">logo</option>
            <option value="branding">branding</option>
          </select>
          <select className="h-10 w-full border px-3 text-sm" name="status" defaultValue="quote">
            <option value="quote">quote</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
            <option value="on_hold">on_hold</option>
            <option value="canceled">canceled</option>
          </select>
          <input className="h-10 w-full border px-3 text-sm" name="start_date" type="date" />
          <input className="h-10 w-full border px-3 text-sm" name="due_date" type="date" />
          <input className="h-10 w-full border px-3 text-sm" name="quote_amount" type="number" step="0.01" placeholder="Quote amount" />
          <textarea className="min-h-20 w-full border px-3 py-2 text-sm" name="description" placeholder="Description" />
          <button className="h-10 w-full border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">
            저장
          </button>
        </form>

        <ProjectTable projects={projects} />
      </section>
    </AppShell>
  );
}
