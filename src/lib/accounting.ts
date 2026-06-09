import { roundMoney, toNumber } from "./erp-calculations";
import type { InvoiceStatus } from "../types/erp";

export type AccountTransactionType =
  | "client_payment"
  | "other_income"
  | "vendor_payment"
  | "expense";

export type TransactionDirection = "in" | "out";

export const transactionTypeLabels: Record<AccountTransactionType, string> = {
  client_payment: "클라이언트 입금",
  other_income: "기타 입금",
  vendor_payment: "벤더 지급",
  expense: "경비 지출",
};

export const transactionDirections: Record<
  AccountTransactionType,
  TransactionDirection
> = {
  client_payment: "in",
  other_income: "in",
  vendor_payment: "out",
  expense: "out",
};

export const incomeCategories = [
  "Design Services",
  "Printing Services",
  "Owner Investment",
  "Refund Received",
  "Other Income",
];

export const expenseCategories = [
  "Advertising & Marketing",
  "Bank Fees",
  "Contractors & Outsourcing",
  "Insurance",
  "Job Materials",
  "Meals & Entertainment",
  "Office Supplies",
  "Printing Costs",
  "Rent & Lease",
  "Software & Subscriptions",
  "Taxes & Licenses",
  "Travel",
  "Utilities",
  "Other Expense",
];

export const paymentMethods = [
  { value: "bank_transfer", label: "Bank Transfer (ACH/Wire)" },
  { value: "debit_card", label: "Debit Card" },
  { value: "credit_card", label: "Credit Card" },
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" },
  { value: "zelle", label: "Zelle" },
  { value: "venmo", label: "Venmo" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
];

export const paymentMethodLabels: Record<string, string> = Object.fromEntries(
  paymentMethods.map((method) => [method.value, method.label]),
);

type TransactionInput = {
  bank_account_id?: string;
  type: AccountTransactionType;
  amount: number | string;
  txn_date?: string;
};

type BankAccountInput = {
  id: string;
  starting_balance: number | string;
};

export function getTransactionDirection(
  type: AccountTransactionType,
): TransactionDirection {
  return transactionDirections[type];
}

export function getSignedAmount(transaction: TransactionInput): number {
  const amount = toNumber(transaction.amount);

  return getTransactionDirection(transaction.type) === "in" ? amount : -amount;
}

export function calculateAccountBalance(
  account: BankAccountInput,
  transactions: TransactionInput[],
): number {
  return roundMoney(
    transactions
      .filter((transaction) => transaction.bank_account_id === account.id)
      .reduce(
        (sum, transaction) => sum + getSignedAmount(transaction),
        toNumber(account.starting_balance),
      ),
  );
}

type LedgerPayment = {
  amount: number | string;
  txn_date: string;
};

type InvoiceSyncSource = {
  total: number | string;
  status: InvoiceStatus;
  paid_amount: number | string;
  stripe_payment_status: string | null;
};

export type InvoiceSyncUpdate = {
  paid_amount: number;
  paid_date: string | null;
  status: InvoiceStatus;
};

function latestTransactionDate(payments: LedgerPayment[]): string | null {
  return (
    payments
      .map((payment) => payment.txn_date)
      .sort()
      .at(-1) ?? null
  );
}

// Recomputes invoice payment fields from ledger transactions linked to it.
// Returns null when nothing should change (e.g. Stripe-paid invoices with
// no ledger entries are left untouched).
export function buildInvoiceSyncUpdate(
  invoice: InvoiceSyncSource,
  payments: LedgerPayment[],
): InvoiceSyncUpdate | null {
  const ledgerPaid = roundMoney(
    payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0),
  );

  if (ledgerPaid <= 0) {
    if (invoice.stripe_payment_status === "paid") {
      return null;
    }

    if (invoice.status !== "paid" && toNumber(invoice.paid_amount) === 0) {
      return null;
    }

    return {
      paid_amount: 0,
      paid_date: null,
      status: invoice.status === "paid" ? "sent" : invoice.status,
    };
  }

  return {
    paid_amount: ledgerPaid,
    paid_date: latestTransactionDate(payments),
    status:
      ledgerPaid >= toNumber(invoice.total)
        ? "paid"
        : invoice.status === "paid"
          ? "sent"
          : invoice.status,
  };
}

export type VendorBillSyncUpdate = {
  status: "received" | "paid";
  paid_date: string | null;
};

export function buildVendorBillSyncUpdate(
  payments: LedgerPayment[],
): VendorBillSyncUpdate {
  const paidDate = latestTransactionDate(payments);

  return paidDate
    ? { status: "paid", paid_date: paidDate }
    : { status: "received", paid_date: null };
}

export function summarizeTransactions(
  transactions: TransactionInput[],
  monthIso: string,
) {
  const monthly = transactions.filter((transaction) =>
    (transaction.txn_date ?? "").startsWith(monthIso),
  );

  const moneyIn = roundMoney(
    monthly
      .filter((transaction) => getTransactionDirection(transaction.type) === "in")
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0),
  );
  const moneyOut = roundMoney(
    monthly
      .filter(
        (transaction) => getTransactionDirection(transaction.type) === "out",
      )
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0),
  );
  const expense = roundMoney(
    monthly
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0),
  );

  return { moneyIn, moneyOut, expense, net: roundMoney(moneyIn - moneyOut) };
}
