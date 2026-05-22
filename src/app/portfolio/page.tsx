import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { createAssetAction } from "@/app/actions";
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

      <form action={createAssetAction} className="mb-6 grid gap-2 border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-5">
        <select className="h-10 border px-3 text-sm" name="project_id" required>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
        <input className="h-10 border px-3 text-sm" name="title" placeholder="Asset title" required />
        <select className="h-10 border px-3 text-sm" name="kind" defaultValue="drive_link"><option value="result_photo">result_photo</option><option value="final_file">final_file</option><option value="drive_link">drive_link</option></select>
        <input className="h-10 border px-3 text-sm" name="external_url" placeholder="URL" />
        <input type="hidden" name="is_portfolio" value="on" />
        <button className="h-10 border border-[var(--coral)] bg-[var(--coral)] text-sm font-semibold text-white">쇼케이스 추가</button>
      </form>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <Link
            key={asset.id}
            href={asset.external_url ?? asset.storage_url ?? `/projects/${asset.project_id}`}
            target={asset.external_url || asset.storage_url ? "_blank" : undefined}
            className="group border border-[var(--border)] bg-white p-4 transition hover:border-[var(--coral)]"
          >
            <div className="aspect-[4/3] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <p className="font-display text-2xl">{asset.title}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--coral-strong)]">{asset.kind}</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold group-hover:text-[var(--coral-strong)]">{asset.projects?.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{asset.projects?.type}</p>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
