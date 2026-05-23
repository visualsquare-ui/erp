import { EmptyState } from "@/components/empty-state";
import { toNumber } from "@/lib/erp-calculations";
import { formatCurrency, formatUsDate } from "@/lib/format";
import type { ProjectType } from "@/lib/project-rules";
import type { JobRow } from "@/types/database";

import { StatusBadge } from "./status-badge";

const typeLabels: Record<ProjectType, string> = {
  web: "웹",
  app: "앱",
  print: "인쇄",
  logo: "로고",
  branding: "브랜딩",
};

type JobTableProps = {
  jobs: JobRow[];
};

export function JobTable({ jobs }: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="Job 없음"
        description="왼쪽 폼에서 첫 Job을 추가하세요."
      />
    );
  }

  return (
    <div className="ui-card overflow-x-auto">
      <table className="ui-table min-w-[860px]">
        <thead>
          <tr>
            <th>Job</th>
            <th>고객</th>
            <th>프로젝트</th>
            <th>유형</th>
            <th>상태</th>
            <th>마감</th>
            <th className="text-right">견적</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b border-[var(--border)]">
              <td>
                <p className="break-words font-semibold text-[var(--foreground)]">
                  {job.name}
                </p>
                <div className="mt-1 max-w-[28rem] break-words text-xs text-[var(--muted)]">
                  {job.description}
                </div>
              </td>
              <td className="text-[var(--muted)]">
                {job.clients?.company_name ?? job.clients?.name ?? "-"}
              </td>
              <td className="text-[var(--muted)]">
                {job.projects?.name ?? "-"}
              </td>
              <td>{typeLabels[job.type]}</td>
              <td>
                <StatusBadge status={job.status} />
              </td>
              <td className="tabular-nums">
                {job.due_date ? formatUsDate(job.due_date) : "-"}
              </td>
              <td className="text-right font-semibold tabular-nums">
                {formatCurrency(toNumber(job.quote_amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
