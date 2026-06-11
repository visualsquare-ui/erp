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

const VS_LOGO_URL = "https://erp.visualsquare.com/logo.png";

export function buildInvoiceEmailHtml(invoice: InvoiceDocument) {
  const recipient = getInvoiceRecipient(invoice);
  const invoiceNumber = escapeHtml(invoice.invoice_number);
  const clientName = escapeHtml(recipient.name);
  const total = formatCurrency(toNumber(invoice.total));
  const dueDate = formatUsDate(invoice.due_date);
  const instructions = getPaymentInstructions();
  const memo = escapeHtml(buildPaymentMemoNote(invoice.invoice_number));

  const paymentRows = instructions
    .map(
      (instruction, index) => `
        <tr>
          <td style="padding:12px 16px;${index < instructions.length - 1 ? "border-bottom:1px solid #e7e2dd;" : ""}">
            <p style="margin:0;font-weight:700;font-size:14px;color:#141414;">${escapeHtml(instruction.label)}</p>
            ${instruction.lines
              .map(
                (line) =>
                  `<p style="margin:3px 0 0;color:#6f6660;font-size:13px;line-height:1.5;">${escapeHtml(line)}</p>`,
              )
              .join("")}
          </td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice ${invoiceNumber} from Visual Square</title>
  </head>
  <body style="margin:0;padding:0;background:#fbf6f3;color:#141414;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Invoice ${invoiceNumber} — Total ${total}, due ${dueDate}.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf6f3;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #e7e2dd;">
            <tr>
              <td style="padding:32px 36px 24px;border-bottom:1px solid #e7e2dd;">
                <img src="${VS_LOGO_URL}" alt="Visual Square" width="168" style="display:block;width:168px;max-width:60%;height:auto;border:0;" />
                <p style="margin:24px 0 0;color:#9a928c;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">Invoice</p>
                <h1 style="margin:6px 0 0;font-size:26px;line-height:1.2;font-weight:700;color:#141414;">${invoiceNumber}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 8px;">
                <p style="margin:0 0 16px;font-size:16px;color:#141414;">Hi ${clientName},</p>
                <p style="margin:0 0 24px;color:#6f6660;font-size:15px;line-height:1.65;">Thank you for working with Visual Square. Your invoice is ready and attached to this email as a PDF. A summary is below for your convenience.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e2dd;margin-bottom:28px;">
                  <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid #e7e2dd;">
                      <span style="color:#6f6660;font-size:14px;">Amount due</span>
                    </td>
                    <td align="right" style="padding:16px 20px;border-bottom:1px solid #e7e2dd;">
                      <strong style="font-size:22px;color:#141414;">${total}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px;">
                      <span style="color:#6f6660;font-size:14px;">Due date</span>
                    </td>
                    <td align="right" style="padding:14px 20px;">
                      <strong style="font-size:15px;color:#141414;">${dueDate}</strong>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 10px;color:#9a928c;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">How to pay</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e2dd;">
                  ${paymentRows}
                </table>
                <p style="margin:12px 0 28px;color:#f57d4b;font-size:13px;font-weight:700;line-height:1.5;">${memo}</p>
                <p style="margin:0 0 4px;color:#141414;font-size:15px;line-height:1.65;">If you have any questions about this invoice, just reply to this email — we're happy to help.</p>
                <p style="margin:20px 0 0;color:#141414;font-size:15px;">Warm regards,</p>
                <p style="margin:2px 0 0;color:#141414;font-size:15px;font-weight:700;">The Visual Square Team</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px;border-top:1px solid #e7e2dd;">
                <p style="margin:0;color:#9a928c;font-size:12px;line-height:1.6;">Visual Square LLC · 260 Broad Ave #121, Palisades Park, NJ 07650<br/>Design &amp; print for local businesses</p>
              </td>
            </tr>
            <tr>
              <td style="height:5px;background:#f57d4b;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildInvoiceEmailText(invoice: InvoiceDocument) {
  const recipient = getInvoiceRecipient(invoice);
  const instructions = getPaymentInstructions();

  return [
    `Hi ${recipient.name},`,
    "",
    "Thank you for working with Visual Square. Your invoice is ready and",
    "attached to this email as a PDF. Here is a quick summary:",
    "",
    `Invoice: ${invoice.invoice_number}`,
    `Amount due: ${formatCurrency(toNumber(invoice.total))}`,
    `Due date: ${formatUsDate(invoice.due_date)}`,
    "",
    "How to pay:",
    ...instructions.map(
      (instruction) => `  ${instruction.label}: ${instruction.lines.join(", ")}`,
    ),
    "",
    buildPaymentMemoNote(invoice.invoice_number),
    "",
    "If you have any questions about this invoice, just reply to this email.",
    "",
    "Warm regards,",
    "The Visual Square Team",
    "Visual Square LLC · 260 Broad Ave #121, Palisades Park, NJ 07650",
  ].join("\n");
}
