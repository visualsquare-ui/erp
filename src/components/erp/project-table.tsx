import Link from "next/link";

import { EmptyState } from "@/components/erp/empty-state";
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
  if (projects.length === 0) {
    return (
      <EmptyState
        title="프로젝트 그룹 없음"
        description="큰 작업 묶음이 생기면 왼쪽 폼에서 추가하세요."
      />
    );
  }

  return (
    <div className="ui-card overflow-x-auto">
      <table className="ui-table min-w-[860px]">
        <thead>
          <tr>
            <th>프로젝트 그룹</th>
            <th>고객</th>
            <th>유형</th>
            <th>상태</th>
            <th>마감</th>
            <th className="text-right">견적</th>
            <th>발주·빌</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const workflow = getProjectWorkflow(project.type);

            return (
              <tr key={project.id} className="border-b border-[var(--border)]">
                <td>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-semibold text-[var(--foreground)] hover:text-[var(--coral-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
                  >
                    {project.name}
                  </Link>
                  <div className="mt-1 max-w-[28rem] break-words text-xs text-[var(--muted)]">
                    {project.description}
                  </div>
                </td>
                <td className="text-[var(--muted)]">
                  {project.clients?.company_name ?? project.clients?.name}
                </td>
                <td>{typeLabels[project.type]}</td>
                <td>
                  <StatusBadge status={project.status} />
                </td>
                <td className="tabular-nums">
                  {project.due_date ? formatUsDate(project.due_date) : "-"}
                </td>
                <td className="text-right font-semibold tabular-nums">
                  {formatCurrency(toNumber(project.quote_amount))}
                </td>
                <td>
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
