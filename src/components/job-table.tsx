import { Pencil, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ListActionButton } from "@/components/list-action-button";
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
  onEdit?: (job: JobRow) => void;
  onDelete?: (job: JobRow) => void;
};

export function JobTable({ jobs, onEdit, onDelete }: JobTableProps) {
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
      <table className="ui-table jobs-table">
        <colgroup>
          <col className="jobs-table-job" />
          <col className="jobs-table-client" />
          <col className="jobs-table-project jobs-table-optional" />
          <col className="jobs-table-type" />
          <col className="jobs-table-status" />
          <col className="jobs-table-due jobs-table-optional" />
          <col className="jobs-table-quote jobs-table-optional" />
          {onEdit || onDelete ? <col className="jobs-table-actions" /> : null}
        </colgroup>
        <thead>
          <tr>
            <th>Job</th>
            <th>고객</th>
            <th className="jobs-table-optional">프로젝트</th>
            <th className="whitespace-nowrap">유형</th>
            <th className="whitespace-nowrap">상태</th>
            <th className="jobs-table-optional whitespace-nowrap">마감</th>
            <th className="jobs-table-optional text-right">견적</th>
            {onEdit || onDelete ? (
              <th className="whitespace-nowrap text-right">관리</th>
            ) : null}
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
              <td className="break-words text-[var(--muted)]">
                {job.clients?.company_name ?? job.clients?.name ?? "-"}
              </td>
              <td className="jobs-table-optional break-words text-[var(--muted)]">
                {job.projects?.name ?? "-"}
              </td>
              <td className="whitespace-nowrap">{typeLabels[job.type]}</td>
              <td className="whitespace-nowrap">
                <StatusBadge status={job.status} />
              </td>
              <td className="jobs-table-optional whitespace-nowrap tabular-nums">
                {job.due_date ? formatUsDate(job.due_date) : "-"}
              </td>
              <td className="jobs-table-optional whitespace-nowrap text-right font-semibold tabular-nums">
                {formatCurrency(toNumber(job.quote_amount))}
              </td>
              {onEdit || onDelete ? (
                <td className="whitespace-nowrap">
                  <div className="flex flex-nowrap justify-end gap-1">
                    {onEdit ? (
                      <ListActionButton
                        icon={
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        }
                        onClick={() => onEdit(job)}
                      >
                        수정
                      </ListActionButton>
                    ) : null}
                    {onDelete ? (
                      <ListActionButton
                        icon={
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        }
                        tone="danger"
                        onClick={() => onDelete(job)}
                      >
                        삭제
                      </ListActionButton>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
