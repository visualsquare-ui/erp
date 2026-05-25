import Link from "next/link";

import { AppShell } from "@/components/erp/app-shell";
import { EmptyState } from "@/components/erp/empty-state";
import { PageHeader } from "@/components/erp/page-header";
import { createAssetAction } from "@/app/(erp)/actions";
import { getPortfolioPageData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const { user, projects, assets } = await getPortfolioPageData();

  return (
    <AppShell userEmail={user.email ?? "Staff"} activePath="/portfolio">
      <PageHeader
        eyebrow="Showcase"
        title="포트폴리오 쇼케이스"
        description="프로젝트 결과물 중 제안/영업 자료로 보여줄 자산만 모아봅니다."
      />

      <form action={createAssetAction} className="ui-panel mb-6 grid gap-3 md:grid-cols-[1.1fr_1fr_0.8fr_1.2fr_auto] md:items-end">
        <Field label="Project">
          <select className="ui-input" name="project_id" required>
            <option value="">Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title">
          <input className="ui-input" name="title" placeholder="Installed signage…" autoComplete="off" required />
        </Field>
        <Field label="Kind">
          <select className="ui-input" name="kind" defaultValue="drive_link"><option value="result_photo">result_photo</option><option value="final_file">final_file</option><option value="drive_link">drive_link</option></select>
        </Field>
        <Field label="URL">
          <input className="ui-input" name="external_url" type="url" placeholder="https://drive.google.com/…" autoComplete="off" />
        </Field>
        <input type="hidden" name="is_portfolio" value="on" />
        <button className="ui-button whitespace-nowrap">쇼케이스 추가</button>
      </form>

      {assets.length === 0 ? (
        <EmptyState title="포트폴리오 자산 없음" description="프로젝트 결과물에서 쇼케이스 자산을 추가하세요." />
      ) : (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <Link
            key={asset.id}
            href={asset.external_url ?? asset.storage_url ?? `/projects/${asset.project_id}`}
            target={asset.external_url || asset.storage_url ? "_blank" : undefined}
            rel={asset.external_url || asset.storage_url ? "noreferrer" : undefined}
            className="group ui-card p-4 transition-colors hover:border-[var(--coral)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
          >
            <div className="aspect-[4/3] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex h-full items-center justify-center text-center">
                <div className="min-w-0">
                  <p className="font-display break-words text-2xl">{asset.title}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--coral-strong)]">{asset.kind}</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold group-hover:text-[var(--coral-strong)]">{asset.projects?.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{asset.projects?.type}</p>
          </Link>
        ))}
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
    <label className="block min-w-0 space-y-1.5">
      <span className="ui-label">{label}</span>
      {children}
    </label>
  );
}
