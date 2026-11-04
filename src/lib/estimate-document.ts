import type { ClientRow, EstimateItemRow, EstimateRow } from "@/types/database";

import { roundMoney, toNumber } from "./erp-calculations";
import { addPaymentTermDays, formatCurrency, formatUsDate } from "./format";

export type EstimateDocument = EstimateRow & {
  clients?: Pick<ClientRow, "company_name" | "name" | "email" | "address"> | null;
  estimate_items: EstimateItemRow[];
};

export type EstimateDocumentLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isTaxable: boolean;
  taxRate: number;
};

export const ESTIMATE_NUMBER_PREFIX = "EST";
export const ESTIMATE_VALID_DAYS = 30;

/**
 * Browsers submit textarea line breaks as CRLF. The PDF font has no glyph for
 * a bare carriage return, so it renders as a box at the end of each line.
 */
export function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

export function getEstimateNotes(estimate: Pick<EstimateRow, "notes">): string {
  return normalizeLineBreaks(estimate.notes ?? "").trim();
}

export function getEstimateRecipient(estimate: EstimateDocument) {
  const companyName = estimate.clients?.company_name ?? "";
  const contactName = estimate.clients?.name ?? "";

  return {
    name: companyName || contactName || "Client",
    contact: companyName && contactName ? contactName : "",
    email: estimate.clients?.email ?? "",
    address: estimate.clients?.address ?? "",
  };
}

export function buildEstimateLineItems(
  estimate: EstimateDocument,
): EstimateDocumentLine[] {
  return [...estimate.estimate_items]
    .sort((a, b) => toNumber(a.position) - toNumber(b.position))
    .map((item) => ({
      description: normalizeLineBreaks(item.description),
      quantity: toNumber(item.quantity),
      unitPrice: toNumber(item.unit_price),
      amount: toNumber(item.amount),
      isTaxable: item.is_taxable,
      taxRate: toNumber(item.tax_rate),
    }));
}

export function getDefaultEstimateValidUntil(issueDate: string): string {
  return addPaymentTermDays(issueDate, "net_30");
}

/**
 * Next estimate number for the issue year, e.g. EST-2026-0003.
 * Uses the highest existing sequence for that year so deleted
 * estimates never cause a duplicate number.
 */
export function buildNextEstimateNumber(
  existingNumbers: string[],
  issueDate: string,
): string {
  const year = issueDate.slice(0, 4);
  const pattern = new RegExp(`^${ESTIMATE_NUMBER_PREFIX}-${year}-(\\d+)$`);
  const highest = existingNumbers.reduce((max, value) => {
    const match = pattern.exec(value.trim());
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${ESTIMATE_NUMBER_PREFIX}-${year}-${String(highest + 1).padStart(4, "0")}`;
}

export function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : String(roundMoney(value));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const VS_LOGO_URL = "https://erp.visualsquare.com/logo.png";

function getGreetingName(estimate: EstimateDocument) {
  const recipient = getEstimateRecipient(estimate);
  return recipient.contact || recipient.name;
}

export function buildEstimateEmailSubject(estimate: EstimateDocument) {
  return `Estimate ${estimate.estimate_number} from Visual Square`;
}

export function buildEstimateEmailHtml(estimate: EstimateDocument) {
  const estimateNumber = escapeHtml(estimate.estimate_number);
  const greetingName = escapeHtml(getGreetingName(estimate));
  const total = formatCurrency(toNumber(estimate.total));
  const validUntil = estimate.valid_until
    ? formatUsDate(estimate.valid_until)
    : null;
  const lines = buildEstimateLineItems(estimate);

  const lineRows = lines
    .map(
      (line, index) => `
        <tr>
          <td style="padding:12px 16px;${index < lines.length - 1 ? "border-bottom:1px solid #e7e2dd;" : ""}color:#141414;font-size:14px;line-height:1.5;">${escapeHtml(line.description)}<br/><span style="color:#6f6660;font-size:13px;">${formatQuantity(line.quantity)} x ${formatCurrency(line.unitPrice)}</span></td>
          <td align="right" style="padding:12px 16px;${index < lines.length - 1 ? "border-bottom:1px solid #e7e2dd;" : ""}color:#141414;font-size:14px;font-weight:700;white-space:nowrap;vertical-align:top;">${formatCurrency(line.amount)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Estimate ${estimateNumber} from Visual Square</title>
  </head>
  <body style="margin:0;padding:0;background:#fbf6f3;color:#141414;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Estimate ${estimateNumber}, total ${total}.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf6f3;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #e7e2dd;">
            <tr>
              <td style="padding:32px 36px 24px;border-bottom:1px solid #e7e2dd;">
                <img src="${VS_LOGO_URL}" alt="Visual Square" width="134" style="display:block;width:134px;max-width:50%;height:auto;border:0;" />
                <p style="margin:24px 0 0;color:#9a928c;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">Estimate</p>
                <h1 style="margin:6px 0 0;font-size:26px;line-height:1.2;font-weight:700;color:#141414;">${estimateNumber}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 8px;">
                <p style="margin:0 0 16px;font-size:16px;color:#141414;">Hi ${greetingName},</p>
                <p style="margin:0 0 24px;color:#6f6660;font-size:15px;line-height:1.65;">Thanks for reaching out. Your estimate is attached as a PDF. Here is a quick summary.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e2dd;margin-bottom:16px;">
                  ${lineRows}
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e2dd;margin-bottom:28px;">
                  <tr>
                    <td style="padding:16px 20px;${validUntil ? "border-bottom:1px solid #e7e2dd;" : ""}">
                      <span style="color:#6f6660;font-size:14px;">Estimate total</span>
                    </td>
                    <td align="right" style="padding:16px 20px;${validUntil ? "border-bottom:1px solid #e7e2dd;" : ""}">
                      <strong style="font-size:22px;color:#141414;">${total}</strong>
                    </td>
                  </tr>
                  ${
                    validUntil
                      ? `<tr>
                    <td style="padding:14px 20px;">
                      <span style="color:#6f6660;font-size:14px;">Valid until</span>
                    </td>
                    <td align="right" style="padding:14px 20px;">
                      <strong style="font-size:15px;color:#141414;">${validUntil}</strong>
                    </td>
                  </tr>`
                      : ""
                  }
                </table>
                <p style="margin:0 0 4px;color:#141414;font-size:15px;line-height:1.65;">If everything looks good, just reply to this email and we will get started. If you want to change anything, let me know.</p>
                <p style="margin:20px 0 0;color:#141414;font-size:15px;">Best regards,</p>
                <p style="margin:2px 0 0;color:#141414;font-size:15px;font-weight:700;">Kevin Koo</p>
                <p style="margin:2px 0 0;color:#6f6660;font-size:14px;">Visual Square</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px;border-top:1px solid #e7e2dd;">
                <p style="margin:0;color:#9a928c;font-size:12px;line-height:1.6;">Visual Square · Design &amp; print for local businesses</p>
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

export function buildEstimateEmailText(estimate: EstimateDocument) {
  const lines = buildEstimateLineItems(estimate);

  return [
    `Hi ${getGreetingName(estimate)},`,
    "",
    "Thanks for reaching out. Your estimate is attached as a PDF.",
    "Here is a quick summary:",
    "",
    `Estimate: ${estimate.estimate_number}`,
    ...lines.map(
      (line) =>
        `  ${line.description}: ${formatQuantity(line.quantity)} x ${formatCurrency(line.unitPrice)} = ${formatCurrency(line.amount)}`,
    ),
    `Total: ${formatCurrency(toNumber(estimate.total))}`,
    ...(estimate.valid_until
      ? [`Valid until: ${formatUsDate(estimate.valid_until)}`]
      : []),
    "",
    "If everything looks good, just reply to this email and we will get started.",
    "If you want to change anything, let me know.",
    "",
    "Best regards,",
    "Kevin Koo",
    "Visual Square",
  ].join("\n");
}
