import Link from "next/link";
import { AlertCircle, ArrowUpRight, Clock3 } from "lucide-react";

import {
  calculateAccountBalance,
  summarizeTransactions,
} from "@/lib/accounting";
import {
  calculateOutstandingAp,
  calculateOutstandingAr,
  roundMoney,
  toNumber,
} from "@/lib/erp-calculations";
import { formatCurrency, formatUsDate } from "@/lib/format";
import type {
  AccountTransactionRow,
  AssetRow,
  BankAccountRow,
  ClientRow,
  InvoiceRow,
  JobRow,
  ProjectRow,
  TaskRow,
  VendorBillRow,
} from "@/types/database";

import { MetricCard } from "./metric-card";
import { JobTable } from "./job-table";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "./empty-state";

type DashboardProps = {
  data: {
    clients: ClientRow[];
    projects: ProjectRow[];
    jobs: JobRow[];
    tasks: TaskRow[];
    invoices: InvoiceRow[];
    bills: VendorBillRow[];
    assets: AssetRow[];
    accounts: BankAccountRow[];
    transactions: AccountTransactionRow[];
  };
};

export function Dashboard({ data }: DashboardProps) {
  const activeJobs = data.jobs.filter(
    (job) => job.status === "in_progress" || job.status === "quote",
  );
  const sentInvoices = data.invoices.filter(
    (invoice) => invoice.status !== "paid",
  );
  const openBills = data.bills.filter((bill) => bill.status !== "paid");
  const outstandingAr = calculateOutstandingAr(
    data.invoices.map((invoice) => ({
      total: toNumber(invoice.total),
      paidAmount: toNumber(invoice.paid_amount),
      status: invoice.status,
    })),
  );
  const outstandingAp = calculateOutstandingAp(
    data.bills.map((bill) => ({
      amount: toNumber(bill.amount),
      status: bill.status,
    })),
  );
  const currentMonthIso = new Date().toISOString().slice(0, 7);
  const [currentYear, currentMonth] = currentMonthIso.split("-");
  const monthlyRevenue = data.invoices
    .filter((invoice) => invoice.issue_date.startsWith(currentMonthIso))
    .reduce((sum, invoice) => sum + toNumber(invoice.total), 0);
  const totalBalance = roundMoney(
    data.accounts.reduce(
      (sum, account) =>
        sum + calculateAccountBalance(account, data.transactions),
      0,
    ),
  );
  const cashFlow = summarizeTransactions(data.transactions, currentMonthIso);
  const urgentTasks = data.tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
    .slice(0, 3);

  return (
    <div>
      <section className="border-b border-[var(--border)] pb-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--coral-strong)]">
            Visual Square ERP
          </p>
          <h1 className="mt-2 max-w-4xl break-keep text-2xl font-semibold tracking-normal text-[var(--foreground)] sm:text-3xl md:text-4xl">
            Job 중심 운영 대시보드
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            고객, Job, 인보이스, 발주·빌, 결과물을 실제 작업 단위에
            묶어서 디자인 에이전시와 인쇄 중개 업무의 마진을 추적합니다.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="진행 Jobs"
          value={`${activeJobs.length}`}
          detail={`${data.clients.length}개 고객 기준`}
          tone="coral"
        />
        <MetricCard
          label="이번 달 매출"
          value={formatCurrency(monthlyRevenue)}
          detail={`${currentYear}년 ${Number(currentMonth)}월 발행 인보이스`}
          tone="green"
        />
        <MetricCard
          label="미수금"
          value={formatCurrency(outstandingAr)}
          detail={`${sentInvoices.length}건 추적 중`}
          tone="blue"
        />
        <MetricCard
          label="미지급금"
          value={formatCurrency(outstandingAp)}
          detail={`${openBills.length}건 AP`}
        />
        <MetricCard
          label="포트폴리오"
          value={`${data.assets.filter((asset) => asset.is_portfolio).length}`}
          detail="쇼케이스 노출 자산"
        />
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-2">
        <Link href="/accounting" className="block">
          <MetricCard
            label="은행 잔액"
            value={formatCurrency(totalBalance)}
            detail={`${data.accounts.length}개 계좌 · 어카운팅 장부 기준`}
            tone="coral"
          />
        </Link>
        <Link href="/accounting" className="block">
          <MetricCard
            label="이번 달 현금흐름"
            value={formatCurrency(cashFlow.net)}
            detail={`입금 ${formatCurrency(cashFlow.moneyIn)} · 지출 ${formatCurrency(cashFlow.moneyOut)}`}
            tone={cashFlow.net >= 0 ? "green" : "neutral"}
          />
        </Link>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Job 허브</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                실제 작업 단위로 견적, 발주, 청구 흐름을 추적합니다.
              </p>
            </div>
            <Link
              href="/jobs"
              className="ui-button min-h-9 px-3"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" aria-hidden="true" />
              Jobs
            </Link>
          </div>
          <JobTable jobs={data.jobs} />
        </div>

        <aside className="space-y-6">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[var(--coral)]" />
              <h2 className="text-lg font-semibold">마감 임박</h2>
            </div>
            <div className="ui-card overflow-hidden">
              {urgentTasks.length === 0 ? (
                <EmptyState
                  title="마감 임박 작업 없음"
                  description="열린 작업이 생기면 여기에 표시됩니다."
                />
              ) : (
                urgentTasks.map((task) => {
                const project = data.projects.find(
                  (item) => item.id === task.project_id,
                );

                return (
                    <div
                      key={task.id}
                      className="border-b border-[var(--border)] px-4 py-4 last:border-b-0"
                    >
                    <p className="break-words text-sm font-semibold">{task.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {project?.name}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-[var(--muted)]">
                        {task.assignee}
                      </span>
                      <span className="text-xs font-semibold">
                        {task.due_date ? formatUsDate(task.due_date) : "-"}
                      </span>
                    </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[var(--coral)]" />
              <h2 className="text-lg font-semibold">인보이스 상태</h2>
            </div>
            <div className="ui-card overflow-hidden">
              {data.invoices.length === 0 ? (
                <EmptyState
                  title="인보이스 없음"
                  description="발행한 인보이스가 생기면 상태가 표시됩니다."
                />
              ) : (
                data.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border-b border-[var(--border)] px-4 py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="break-words text-sm font-semibold">
                        {invoice.invoice_number}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {invoice.clients?.company_name ?? invoice.clients?.name}
                      </p>
                    </div>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">
                      Due {formatUsDate(invoice.due_date)}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(
                        Math.max(
                          toNumber(invoice.total) - toNumber(invoice.paid_amount),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
