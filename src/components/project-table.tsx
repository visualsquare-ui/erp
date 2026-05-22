import Link from "next/link";

import { toNumber } from "@/lib/erp-calculations";
import { getProjectWorkflow } from "@/lib/project-rules";
import { formatCurrency, formatUsDate } from "@/lib/format";
import type { ProjectType } from "@/lib/project-rules";
import type { ProjectRow } from "@/types/database";

import { StatusBadge } from "./status-badge";

const typeLabels: Record<ProjectType, string> = {
  web: "웹",
  app: "앱",
  print: "인쇄",
  logo: "로고",
  branding: "브랜딩",
};

const workflowLabels = {
  hidden: "숨김",
  optional: "선택",
  required: "필수",
};

type ProjectTableProps = {
  projects: ProjectRow[];
};

export function ProjectTable({ projects }: ProjectTableProps) {
  return (
    <div className="overflow-x-auto border border-[var(--border)] bg-white">
      <table className="min-w-[860px] w-full border-collapse text-sm">
        <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
          <tr>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
              프로젝트
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
              고객
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
              유형
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
              상태
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
              마감
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 text-right font-semibold">
              견적
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">
              발주·빌
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const workflow = getProjectWorkflow(project.type);

            return (
              <tr key={project.id} className="border-b border-[var(--border)]">
                <td className="px-4 py-4">
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-semibold text-[var(--foreground)] hover:text-[var(--coral-strong)]"
                  >
                    {project.name}
                  </Link>
                  <div className="mt-1 max-w-[28rem] text-xs text-[var(--muted)]">
                    {project.description}
                  </div>
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  {project.clients?.company_name ?? project.clients?.name}
                </td>
                <td className="px-4 py-4">{typeLabels[project.type]}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-4">
                  {project.due_date ? formatUsDate(project.due_date) : "-"}
                </td>
                <td className="px-4 py-4 text-right font-semibold">
                  {formatCurrency(toNumber(project.quote_amount))}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex h-6 items-center border border-[var(--border)] bg-white px-2 text-xs font-semibold text-[var(--muted)]">
                    {workflowLabels[workflow.purchaseBills]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
