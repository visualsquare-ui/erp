import type { ClientRow, InvoiceItemRow, InvoiceRow } from "@/types/database";

import { toNumber } from "./erp-calculations";
import { formatCurrency, formatUsDate } from "./format";
import {
  buildPaymentMemoNote,
  getPaymentInstructions,
} from "./payment-instructions";

export type InvoiceDocument = InvoiceRow & {
  clients?: Pick<ClientRow, "company_name" | "name" | "email" | "address"> | null;
  invoice_items: InvoiceItemRow[];
};

export type InvoiceDocumentLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isTaxable: boolean;
  taxRate: number;
};

export function getInvoiceRecipient(invoice: InvoiceDocument) {
  return {
    name: invoice.clients?.company_name ?? invoice.clients?.name ?? "Client",
    email: invoice.clients?.email ?? "",
    address: invoice.clients?.address ?? "",
  };
}

export function buildInvoiceLineItems(
  invoice: InvoiceDocument,
): InvoiceDocumentLine[] {
  return invoice.invoice_items.map((item) => ({
    description: item.description,
    quantity: toNumber(item.quantity),
    unitPrice: toNumber(item.unit_price),
    amount: toNumber(item.amount),
    isTaxable: item.is_taxable,
    taxRate: toNumber(item.tax_rate),
  }));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildInvoiceEmailHtml(invoice: InvoiceDocument) {
  const recipient = getInvoiceRecipient(invoice);
  const invoiceNumber = escapeHtml(invoice.invoice_number);
  const clientName = escapeHtml(recipient.name);
  const projectName = escapeHtml(invoice.projects?.name ?? "Project");
  const total = formatCurrency(toNumber(invoice.total));
  const dueDate = formatUsDate(invoice.due_date);
  const instructions = getPaymentInstructions();
  const paymentHtml = `<div style="margin:0 0 24px;">
          <p style="margin:0 0 10px;color:#6f6660;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">How to pay</p>
          <div style="border:1px solid #e7e2dd;">
            ${instructions
              .map(
                (instruction, index) => `
                  <div style="padding:12px 16px;${index < instructions.length - 1 ? "border-bottom:1px solid #e7e2dd;" : ""}">
                    <p style="margin:0;font-weight:700;color:#141414;">${escapeHtml(instruction.label)}</p>
                    ${instruction.lines
                      .map(
                        (line) =>
                          `<p style="margin:2px 0 0;color:#6f6660;font-size:13px;line-height:1.5;">${escapeHtml(line)}</p>`,
                      )
                      .join("")}
                  </div>`,
              )
              .join("")}
          </div>
          <p style="margin:10px 0 0;color:#f57d4b;font-size:12px;font-weight:700;">${escapeHtml(buildPaymentMemoNote(invoice.invoice_number))}</p>
        </div>`;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#fbf6f3;color:#141414;font-family:Inter,Arial,sans-serif;">
    <div style="padding:32px 20px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7e2dd;">
        <div style="padding:28px 32px;border-bottom:1px solid #e7e2dd;">
          <div style="font-family:Georgia,serif;font-size:30px;line-height:0.9;color:#141414;">visual<br><span style="color:#f57d4b;">square</span></div>
          <p style="margin:28px 0 0;color:#6f6660;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Invoice</p>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.2;">${invoiceNumber}</h1>
        </div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:16px;">Hello ${clientName},</p>
          <p style="margin:0 0 24px;color:#6f6660;line-height:1.6;">Attached is the invoice for ${projectName}. Please review it at your convenience.</p>
          <div style="border:1px solid #e7e2dd;padding:18px 20px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;gap:20px;margin-bottom:10px;">
              <span style="color:#6f6660;">Total</span>
              <strong style="font-size:22px;">${total}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:20px;">
              <span style="color:#6f6660;">Due date</span>
              <strong>${dueDate}</strong>
            </div>
          </div>
          ${paymentHtml}
          <p style="margin:0;color:#6f6660;line-height:1.6;">Thank you,<br>Visual Square</p>
        </div>
        <div style="height:6px;background:#f57d4b;"></div>
      </div>
    </div>
  </body>
</html>`;
}

export function buildInvoiceEmailText(invoice: InvoiceDocument) {
  const recipient = getInvoiceRecipient(invoice);
  const instructions = getPaymentInstructions();

  return [
    `Hello ${recipient.name},`,
    "",
    `Attached is invoice ${invoice.invoice_number} for ${formatCurrency(
      toNumber(invoice.total),
    )}.`,
    `Due date: ${formatUsDate(invoice.due_date)}`,
    "",
    "How to pay:",
    ...instructions.map(
      (instruction) => `${instruction.label}: ${instruction.lines.join(", ")}`,
    ),
    buildPaymentMemoNote(invoice.invoice_number),
    "",
    "Thank you,",
    "Visual Square",
  ].join("\n");
}
