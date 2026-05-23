import PDFDocument from "pdfkit";

import { toNumber } from "./erp-calculations";
import { formatCurrency, formatUsDate } from "./format";
import {
  buildInvoiceLineItems,
  getInvoiceRecipient,
  type InvoiceDocument,
} from "./invoice-document";

export async function buildInvoicePdf(invoice: InvoiceDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 48,
      info: {
        Title: `Invoice ${invoice.invoice_number}`,
        Author: "Visual Square",
      },
    });
    const recipient = getInvoiceRecipient(invoice);
    const lines = buildInvoiceLineItems(invoice);

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc
      .font("Times-Roman")
      .fontSize(30)
      .fillColor("#141414")
      .text("visual", 48, 48, { continued: false })
      .fillColor("#f57d4b")
      .text("square", 48, 76);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#f57d4b")
      .text("INVOICE", 390, 52, { align: "right", width: 156 })
      .fontSize(24)
      .fillColor("#141414")
      .text(invoice.invoice_number, 330, 72, { align: "right", width: 216 });

    doc.moveTo(48, 124).lineTo(564, 124).strokeColor("#e7e2dd").stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#6f6660")
      .text("BILL TO", 48, 154)
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("#141414")
      .text(recipient.name, 48, 174)
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6f6660")
      .text(recipient.address || recipient.email || "-", 48, 194, {
        width: 230,
      });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6f6660")
      .text("Issue", 390, 154)
      .fillColor("#141414")
      .text(formatUsDate(invoice.issue_date), 470, 154, { align: "right" })
      .fillColor("#6f6660")
      .text("Due", 390, 174)
      .fillColor("#141414")
      .text(formatUsDate(invoice.due_date), 470, 174, { align: "right" })
      .fillColor("#6f6660")
      .text("Project", 390, 194)
      .fillColor("#141414")
      .text(invoice.projects?.name ?? "-", 470, 194, { align: "right" });

    let y = 256;
    doc.rect(48, y - 24, 516, 28).fill("#fbf6f3");
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#6f6660")
      .text("DESCRIPTION", 60, y - 15)
      .text("QTY", 350, y - 15, { width: 40, align: "right" })
      .text("UNIT", 410, y - 15, { width: 55, align: "right" })
      .text("AMOUNT", 486, y - 15, { width: 60, align: "right" });

    doc.font("Helvetica").fontSize(10).fillColor("#141414");
    lines.forEach((line) => {
      const rowTop = y + 10;
      doc
        .moveTo(48, rowTop - 8)
        .lineTo(564, rowTop - 8)
        .strokeColor("#e7e2dd")
        .stroke();
      doc
        .fillColor("#141414")
        .text(line.description, 60, rowTop, { width: 270 })
        .text(String(line.quantity), 350, rowTop, { width: 40, align: "right" })
        .text(formatCurrency(line.unitPrice), 410, rowTop, {
          width: 55,
          align: "right",
        })
        .text(formatCurrency(line.amount), 486, rowTop, {
          width: 60,
          align: "right",
        });
      y += 32;
    });

    const totalTop = Math.max(y + 22, 420);
    doc
      .moveTo(354, totalTop - 8)
      .lineTo(564, totalTop - 8)
      .strokeColor("#e7e2dd")
      .stroke();
    [
      ["Subtotal", toNumber(invoice.subtotal)],
      ["Tax", toNumber(invoice.tax)],
      ["Total", toNumber(invoice.total)],
    ].forEach(([label, value], index) => {
      const rowY = totalTop + index * 24;
      doc
        .font(index === 2 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(index === 2 ? 12 : 10)
        .fillColor(index === 2 ? "#141414" : "#6f6660")
        .text(String(label), 390, rowY)
        .fillColor("#141414")
        .text(formatCurrency(Number(value)), 486, rowY, {
          width: 60,
          align: "right",
        });
    });

    doc
      .rect(48, 716, 516, 6)
      .fill("#f57d4b")
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#6f6660")
      .text("Visual Square", 48, 736)
      .text("Thank you for your business.", 390, 736, {
        width: 174,
        align: "right",
      });

    doc.end();
  });
}
