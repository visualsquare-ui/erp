import type { InvoiceStatus, ProjectStatus } from "@/types/erp";

const statusLabels: Record<ProjectStatus | InvoiceStatus, string> = {
  quote: "견적",
  in_progress: "진행중",
  done: "완료",
  on_hold: "보류",
  canceled: "취소",
  draft: "초안",
  sent: "발송",
  paid: "입금완료",
  overdue: "연체",
};

const toneByStatus: Record<ProjectStatus | InvoiceStatus, string> = {
  quote: "border-[var(--info)]/30 bg-[#EDF5FA] text-[var(--info)]",
  in_progress:
    "border-[var(--coral)]/35 bg-[var(--coral-quiet)] text-[var(--coral-strong)]",
  done: "border-[var(--success)]/25 bg-[#E9F6EF] text-[var(--success)]",
  on_hold: "border-[var(--warning)]/30 bg-[#FFF7DE] text-[var(--warning)]",
  canceled: "border-[#8A1F1F]/25 bg-[#F8E8E8] text-[#8A1F1F]",
  draft: "border-[var(--border)] bg-white text-[var(--muted)]",
  sent: "border-[var(--info)]/30 bg-[#EDF5FA] text-[var(--info)]",
  paid: "border-[var(--success)]/25 bg-[#E9F6EF] text-[var(--success)]",
  overdue: "border-[#8A1F1F]/25 bg-[#F8E8E8] text-[#8A1F1F]",
};

type StatusBadgeProps = {
  status: ProjectStatus | InvoiceStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center border px-2 text-xs font-semibold ${toneByStatus[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
