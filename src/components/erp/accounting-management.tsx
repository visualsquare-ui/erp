"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  createBankAccountAction,
  createTransactionAction,
  deleteBankAccountAction,
  deleteTransactionAction,
  updateBankAccountAction,
  updateTransactionAction,
} from "@/app/(erp)/actions";
import { EmptyState } from "@/components/erp/empty-state";
import { ListActionButton } from "@/components/erp/list-action-button";
import { MetricCard } from "@/components/erp/metric-card";
import {
  type AccountTransactionType,
  buildProfitAndLoss,
  calculateAccountBalance,
  expenseCategories,
  getSignedAmount,
  getTransactionDirection,
  incomeCategories,
  paymentMethodLabels,
  paymentMethods,
  summarizeTransactions,
  transactionTypeLabels,
} from "@/lib/accounting";
import { roundMoney, toNumber } from "@/lib/erp-calculations";
import { formatCurrency, formatUsDate } from "@/lib/format";
import type {
  AccountTransactionRow,
  BankAccountRow,
  ClientRow,
  VendorRow,
} from "@/types/database";

type InvoiceOption = {
  id: string;
  invoice_number: string;
  total: string | number;
  status: string;
  clients: Pick<ClientRow, "company_name" | "name"> | null;
};

type BillOption = {
  id: string;
  bill_number: string | null;
  amount: string | number;
  status: string;
  vendors: Pick<VendorRow, "name"> | null;
};

type AccountingManagementProps = {
  accounts: BankAccountRow[];
  transactions: AccountTransactionRow[];
  clients: ClientRow[];
  vendors: VendorRow[];
  invoices: InvoiceOption[];
  bills: BillOption[];
};

const accountTypeLabels: Record<BankAccountRow["account_type"], string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  cash: "Cash",
};

const typeFilterOptions: { value: "all" | AccountTransactionType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "client_payment", label: "클라이언트 입금" },
  { value: "other_income", label: "기타 입금" },
  { value: "vendor_payment", label: "벤더 지급" },
  { value: "expense", label: "경비 지출" },
];

export function AccountingManagement({
  accounts,
  transactions,
  clients,
  vendors,
  invoices,
  bills,
}: AccountingManagementProps) {
  const [transactionFormMode, setTransactionFormMode] = useState<
    "closed" | "create" | "edit"
  >("closed");
  const [editingTransaction, setEditingTransaction] =
    useState<AccountTransactionRow | null>(null);
  const [accountFormMode, setAccountFormMode] = useState<
    "closed" | "create" | "edit"
  >("closed");
  const [editingAccount, setEditingAccount] = useState<BankAccountRow | null>(
    null,
  );
  const [typeFilter, setTypeFilter] = useState<"all" | AccountTransactionType>(
    "all",
  );

  const currentMonthIso = new Date().toISOString().slice(0, 7);
  const [reportMonth, setReportMonth] = useState(currentMonthIso);
  const profitAndLoss = useMemo(
    () => buildProfitAndLoss(transactions, reportMonth),
    [transactions, reportMonth],
  );
  const summary = useMemo(
    () => summarizeTransactions(transactions, currentMonthIso),
    [transactions, currentMonthIso],
  );
  const totalBalance = useMemo(
    () =>
      roundMoney(
        accounts.reduce(
          (sum, account) =>
            sum + calculateAccountBalance(account, transactions),
          0,
        ),
      ),
    [accounts, transactions],
  );

  const visibleTransactions =
    typeFilter === "all"
      ? transactions
      : transactions.filter((transaction) => transaction.type === typeFilter);

  function closeTransactionForm() {
    setTransactionFormMode("closed");
    setEditingTransaction(null);
  }

  function closeAccountForm() {
    setAccountFormMode("closed");
    setEditingAccount(null);
  }

  async function deleteTransaction(transaction: AccountTransactionRow) {
    const confirmed = window.confirm("이 거래 기록을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("transaction_id", transaction.id);
    await deleteTransactionAction(formData);

    if (editingTransaction?.id === transaction.id) {
      closeTransactionForm();
    }
  }

  async function deleteAccount(account: BankAccountRow) {
    const confirmed = window.confirm(
      "이 계좌를 삭제할까요? 거래 기록이 있는 계좌는 삭제되지 않습니다.",
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("bank_account_id", account.id);
    await deleteBankAccountAction(formData);

    if (editingAccount?.id === account.id) {
      closeAccountForm();
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="총 잔액"
          value={formatCurrency(totalBalance)}
          detail={`${accounts.length}개 계좌 기준`}
          tone="coral"
        />
        <MetricCard
          label="이번 달 입금"
          value={formatCurrency(summary.moneyIn)}
          detail="클라이언트 입금 + 기타 입금"
          tone="green"
        />
        <MetricCard
          label="이번 달 지출"
          value={formatCurrency(summary.moneyOut)}
          detail="벤더 지급 + 경비 지출"
          tone="blue"
        />
        <MetricCard
          label="이번 달 순현금흐름"
          value={formatCurrency(summary.net)}
          detail={`경비 지출 ${formatCurrency(summary.expense)} 포함`}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">계좌</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              은행 계좌별 시작 잔액과 현재 잔액을 관리합니다.
            </p>
          </div>
          <button
            type="button"
            className="ui-button sm:w-auto"
            onClick={() => {
              setEditingAccount(null);
              setAccountFormMode("create");
            }}
          >
            계좌 추가
          </button>
        </div>

        {accountFormMode !== "closed" ? (
          <BankAccountForm
            key={editingAccount?.id ?? "new-account"}
            mode={accountFormMode === "edit" ? "edit" : "create"}
            account={editingAccount ?? undefined}
            onCancel={closeAccountForm}
            onSaved={closeAccountForm}
          />
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {accounts.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                title="계좌 없음"
                description="계좌 추가를 눌러 첫 은행 계좌를 등록하세요."
              />
            </div>
          ) : (
            accounts.map((account) => {
              const balance = calculateAccountBalance(account, transactions);

              return (
                <article
                  key={account.id}
                  className="border border-[var(--border)] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        {account.institution ?? "Bank"}
                        {account.last4 ? ` ····${account.last4}` : ""}
                      </p>
                      <h3 className="mt-1 break-words font-semibold">
                        {account.name}
                      </h3>
                    </div>
                    <span className="inline-flex h-6 shrink-0 items-center border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-semibold text-[var(--muted)]">
                      {accountTypeLabels[account.account_type]}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-semibold tabular-nums">
                    {formatCurrency(balance)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    시작 잔액 {formatCurrency(toNumber(account.starting_balance))}
                    {account.opened_date
                      ? ` · 개설 ${formatUsDate(account.opened_date)}`
                      : ""}
                    {account.is_active ? "" : " · 비활성"}
                  </p>
                  <div className="mt-3 flex justify-end gap-1 border-t border-[var(--border)] pt-2">
                    <ListActionButton
                      icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => {
                        setEditingAccount(account);
                        setAccountFormMode("edit");
                      }}
                    >
                      수정
                    </ListActionButton>
                    <ListActionButton
                      icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      tone="danger"
                      onClick={() => void deleteAccount(account)}
                    >
                      삭제
                    </ListActionButton>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">거래 기록</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              클라이언트 입금, 벤더 지급, 경비 지출을 한 곳에서 추적합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="ui-input h-9 w-auto text-sm"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as "all" | AccountTransactionType)
              }
              aria-label="거래 유형 필터"
            >
              {typeFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ui-button shrink-0 whitespace-nowrap sm:w-auto"
              onClick={() => {
                setEditingTransaction(null);
                setTransactionFormMode("create");
              }}
            >
              거래 추가
            </button>
          </div>
        </div>

        {transactionFormMode !== "closed" ? (
          <TransactionForm
            key={editingTransaction?.id ?? "new-transaction"}
            mode={transactionFormMode === "edit" ? "edit" : "create"}
            transaction={editingTransaction ?? undefined}
            accounts={accounts}
            clients={clients}
            vendors={vendors}
            invoices={invoices}
            bills={bills}
            onCancel={closeTransactionForm}
            onSaved={closeTransactionForm}
          />
        ) : null}

        <div className="ui-card overflow-x-auto">
          {visibleTransactions.length === 0 ? (
            <EmptyState
              title="거래 없음"
              description="거래 추가를 눌러 첫 입출금 기록을 등록하세요."
            />
          ) : (
            <div className="min-w-[56rem]">
              <div className="grid h-9 grid-cols-[6rem_8.5rem_minmax(0,1fr)_10rem_9rem_7.5rem_8.5rem] items-center gap-2 border-b border-[var(--border)] px-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                <span>Date</span>
                <span>Type</span>
                <span>Payee / Description</span>
                <span>Category</span>
                <span>Method</span>
                <span className="text-right">Amount</span>
                <span />
              </div>
              <div className="divide-y divide-[var(--border)]">
                {visibleTransactions.map((transaction) => {
                  const signed = getSignedAmount(transaction);
                  const counterpartyName =
                    transaction.payee ??
                    transaction.clients?.company_name ??
                    transaction.clients?.name ??
                    transaction.vendors?.name ??
                    "-";

                  return (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-[6rem_8.5rem_minmax(0,1fr)_10rem_9rem_7.5rem_8.5rem] items-center gap-2 px-3 py-2.5 text-sm"
                    >
                      <span className="tabular-nums text-[var(--muted)]">
                        {formatUsDate(transaction.txn_date)}
                      </span>
                      <TransactionTypeBadge type={transaction.type} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{counterpartyName}</p>
                        {transaction.description ? (
                          <p className="truncate text-xs text-[var(--muted)]">
                            {transaction.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="truncate text-[var(--muted)]">
                        {transaction.category ?? "-"}
                      </span>
                      <span className="truncate text-[var(--muted)]">
                        {transaction.payment_method
                          ? paymentMethodLabels[transaction.payment_method] ??
                            transaction.payment_method
                          : "-"}
                      </span>
                      <span
                        className={`text-right font-semibold tabular-nums ${
                          signed >= 0
                            ? "text-[var(--success)]"
                            : "text-[#8a2f1e]"
                        }`}
                      >
                        {signed >= 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(signed))}
                      </span>
                      <div className="flex justify-end gap-1">
                        <ListActionButton
                          icon={
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setTransactionFormMode("edit");
                          }}
                        >
                          수정
                        </ListActionButton>
                        <ListActionButton
                          icon={
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                          tone="danger"
                          onClick={() => void deleteTransaction(transaction)}
                        >
                          삭제
                        </ListActionButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">월별 손익</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              해당 월의 거래 기록을 카테고리별로 집계합니다 (현금 기준).
            </p>
          </div>
          <input
            className="ui-input h-9 w-auto text-sm"
            type="month"
            value={reportMonth}
            onChange={(event) =>
              setReportMonth(event.target.value || currentMonthIso)
            }
            aria-label="손익 기준 월"
          />
        </div>

        {profitAndLoss.income.length === 0 &&
        profitAndLoss.expense.length === 0 ? (
          <EmptyState
            title="해당 월 거래 없음"
            description="거래 기록이 쌓이면 카테고리별 수입과 지출이 집계됩니다."
          />
        ) : (
          <div className="ui-card">
            <div className="grid divide-y divide-[var(--border)] md:grid-cols-2 md:divide-x md:divide-y-0">
              <ProfitAndLossColumn
                title="수입"
                lines={profitAndLoss.income}
                total={profitAndLoss.incomeTotal}
                tone="in"
              />
              <ProfitAndLossColumn
                title="지출"
                lines={profitAndLoss.expense}
                total={profitAndLoss.expenseTotal}
                tone="out"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <span className="text-sm font-semibold">순이익 (Net)</span>
              <span
                className={`text-base font-semibold tabular-nums ${
                  profitAndLoss.net >= 0
                    ? "text-[var(--success)]"
                    : "text-[#8a2f1e]"
                }`}
              >
                {formatCurrency(profitAndLoss.net)}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfitAndLossColumn({
  title,
  lines,
  total,
  tone,
}: {
  title: string;
  lines: { category: string; total: number }[];
  total: number;
  tone: "in" | "out";
}) {
  return (
    <div className="p-4">
      <h3 className="ui-label">{title}</h3>
      <div className="mt-3 space-y-1.5">
        {lines.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">기록 없음</p>
        ) : (
          lines.map((line) => (
            <p
              key={line.category}
              className="flex justify-between gap-3 text-sm"
            >
              <span className="min-w-0 truncate text-[var(--muted)]">
                {line.category}
              </span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(line.total)}
              </span>
            </p>
          ))
        )}
      </div>
      <p className="mt-3 flex justify-between gap-3 border-t border-[var(--border)] pt-2 text-sm">
        <span className="font-semibold">{title} 합계</span>
        <span
          className={`font-semibold tabular-nums ${
            tone === "in" ? "text-[var(--success)]" : "text-[#8a2f1e]"
          }`}
        >
          {formatCurrency(total)}
        </span>
      </p>
    </div>
  );
}

function TransactionTypeBadge({ type }: { type: AccountTransactionType }) {
  const tone =
    getTransactionDirection(type) === "in"
      ? "border-[var(--success)]/25 bg-[#E9F6EF] text-[var(--success)]"
      : "border-[var(--coral)]/35 bg-[var(--coral-quiet)] text-[var(--coral-strong)]";

  return (
    <span
      className={`inline-flex h-6 w-fit items-center whitespace-nowrap border px-2 text-xs font-semibold ${tone}`}
    >
      {transactionTypeLabels[type]}
    </span>
  );
}

function BankAccountForm({
  mode,
  account,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  account?: BankAccountRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updateBankAccountAction(formData);
    } else {
      await createBankAccountAction(formData);
    }

    onSaved();
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "계좌 수정" : "계좌 추가"}
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={onCancel}
        >
          닫기
        </button>
      </div>

      {account ? (
        <input type="hidden" name="bank_account_id" value={account.id} />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Account Name">
          <input
            className="ui-input"
            name="name"
            placeholder="Business Checking..."
            required
            defaultValue={account?.name ?? ""}
          />
        </Field>
        <Field label="Institution">
          <input
            className="ui-input"
            name="institution"
            placeholder="Bank of America..."
            defaultValue={account?.institution ?? ""}
          />
        </Field>
        <Field label="Account Type">
          <select
            className="ui-input"
            name="account_type"
            defaultValue={account?.account_type ?? "checking"}
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit_card">Credit Card</option>
            <option value="cash">Cash</option>
          </select>
        </Field>
        <Field label="Last 4 Digits (선택)">
          <input
            className="ui-input"
            name="last4"
            placeholder="1234"
            maxLength={4}
            inputMode="numeric"
            defaultValue={account?.last4 ?? ""}
          />
        </Field>
        <Field label="Starting Balance">
          <input
            className="ui-input"
            name="starting_balance"
            type="number"
            step="0.01"
            inputMode="decimal"
            defaultValue={
              account ? String(toNumber(account.starting_balance)) : "0"
            }
          />
        </Field>
        <Field label="Opened Date">
          <input
            className="ui-input"
            name="opened_date"
            type="date"
            defaultValue={account?.opened_date ?? ""}
          />
        </Field>
      </div>
      {mode === "edit" ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            className="h-4 w-4"
            type="checkbox"
            name="is_active"
            defaultChecked={account?.is_active ?? true}
          />
          활성 계좌
        </label>
      ) : null}
      <Field label="Memo">
        <textarea
          className="ui-input min-h-16"
          name="memo"
          placeholder="Internal note..."
          defaultValue={account?.memo ?? ""}
        />
      </Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={onCancel}
        >
          취소
        </button>
        <button className="ui-button">
          {mode === "edit" ? "저장" : "추가"}
        </button>
      </div>
    </form>
  );
}

function TransactionForm({
  mode,
  transaction,
  accounts,
  clients,
  vendors,
  invoices,
  bills,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  transaction?: AccountTransactionRow;
  accounts: BankAccountRow[];
  clients: ClientRow[];
  vendors: VendorRow[];
  invoices: InvoiceOption[];
  bills: BillOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<AccountTransactionType>(
    transaction?.type ?? "expense",
  );
  const direction = getTransactionDirection(type);
  const categories = direction === "in" ? incomeCategories : expenseCategories;

  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updateTransactionAction(formData);
    } else {
      await createTransactionAction(formData);
    }

    onSaved();
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "거래 수정" : "거래 추가"}
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={onCancel}
        >
          닫기
        </button>
      </div>

      {transaction ? (
        <input type="hidden" name="transaction_id" value={transaction.id} />
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Type">
          <select
            className="ui-input"
            name="type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as AccountTransactionType)
            }
          >
            <option value="client_payment">클라이언트 입금</option>
            <option value="other_income">기타 입금</option>
            <option value="vendor_payment">벤더 지급</option>
            <option value="expense">경비 지출</option>
          </select>
        </Field>
        <Field label="Date">
          <input
            className="ui-input"
            name="txn_date"
            type="date"
            required
            defaultValue={
              transaction?.txn_date ?? new Date().toISOString().slice(0, 10)
            }
          />
        </Field>
        <Field label="Account">
          <select
            className="ui-input"
            name="bank_account_id"
            required
            defaultValue={transaction?.bank_account_id ?? accounts[0]?.id ?? ""}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.institution ? `${account.institution} ` : ""}
                {account.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input
            className="ui-input"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            inputMode="decimal"
            defaultValue={
              transaction ? String(toNumber(transaction.amount)) : ""
            }
          />
        </Field>
        <Field label="Category">
          <select
            className="ui-input"
            name="category"
            defaultValue={transaction?.category ?? ""}
          >
            <option value="">선택 안 함</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment Method">
          <select
            className="ui-input"
            name="payment_method"
            defaultValue={transaction?.payment_method ?? ""}
          >
            <option value="">선택 안 함</option>
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {type === "client_payment" ? (
          <>
            <Field label="Client">
              <select
                className="ui-input"
                name="client_id"
                defaultValue={transaction?.client_id ?? ""}
              >
                <option value="">선택 안 함</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name ?? client.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Invoice (연결 시 입금액·상태 자동 반영)">
              <select
                className="ui-input"
                name="invoice_id"
                defaultValue={transaction?.invoice_id ?? ""}
              >
                <option value="">연결 안 함</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} ·{" "}
                    {invoice.clients?.company_name ?? invoice.clients?.name ?? ""}{" "}
                    · {formatCurrency(toNumber(invoice.total))}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : null}
        {type === "vendor_payment" ? (
          <>
            <Field label="Vendor">
              <select
                className="ui-input"
                name="vendor_id"
                defaultValue={transaction?.vendor_id ?? ""}
              >
                <option value="">선택 안 함</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bill (연결 시 자동 Paid 처리)">
              <select
                className="ui-input"
                name="vendor_bill_id"
                defaultValue={transaction?.vendor_bill_id ?? ""}
              >
                <option value="">연결 안 함</option>
                {bills.map((bill) => (
                  <option key={bill.id} value={bill.id}>
                    {bill.bill_number ?? "No number"} ·{" "}
                    {bill.vendors?.name ?? ""} ·{" "}
                    {formatCurrency(toNumber(bill.amount))}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : null}
        <Field label="Payee / Payer">
          <input
            className="ui-input"
            name="payee"
            placeholder={
              direction === "in" ? "입금한 사람/회사..." : "지급 대상..."
            }
            defaultValue={transaction?.payee ?? ""}
          />
        </Field>
        <Field label="Description">
          <input
            className="ui-input"
            name="description"
            placeholder="거래 내용..."
            defaultValue={transaction?.description ?? ""}
          />
        </Field>
      </div>
      <Field label="Memo">
        <textarea
          className="ui-input min-h-16"
          name="memo"
          placeholder="Internal note..."
          defaultValue={transaction?.memo ?? ""}
        />
      </Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={onCancel}
        >
          취소
        </button>
        <button className="ui-button">
          {mode === "edit" ? "저장" : "추가"}
        </button>
      </div>
    </form>
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
