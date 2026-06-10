import path from "node:path";
import fs from "node:fs";
import PDFDocument from "pdfkit";

import { toNumber } from "./erp-calculations";
import { formatCurrency, formatUsDate } from "./format";
import {
  buildInvoiceLineItems,
  getInvoiceRecipient,
  type InvoiceDocument,
} from "./invoice-document";
import {
  buildPaymentMemoNote,
  getPaymentInstructions,
} from "./payment-instructions";

const COLORS = {
  ink: "#141414",
  muted: "#6f6660",
  faint: "#9a928c",
  line: "#e7e2dd",
  coral: "#f57d4b",
};

export async function buildInvoicePdf(invoice: InvoiceDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 48,
      autoFirstPage: false,
      info: {
        Title: `Invoice ${invoice.invoice_number}`,
        Author: "Visual Square",
      },
    });
    const recipient = getInvoiceRecipient(invoice);
    const lines = buildInvoiceLineItems(invoice);
    const paymentInstructions = getPaymentInstructions();
    const logoPath = path.join(process.cwd(), "assets", "vs-logo-transparent.png");
    const logoImage = fs.readFileSync(logoPath);
    const venmoQrPath = path.join(process.cwd(), "assets", "venmo-qr.png");
    const venmoQrImage = fs.readFileSync(venmoQrPath);
    const fontPath = path.join(
      process.cwd(),
      "node_modules",
      "next",
      "dist",
      "compiled",
      "@vercel",
      "og",
      "Geist-Regular.ttf",
    );
    const fontData = fs.readFileSync(fontPath);

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.registerFont("VS", fontData);
    doc.font("VS");
    doc.addPage();

    function strongRule(y: number, x1 = 48, x2 = 564) {
      doc
        .moveTo(x1, y)
        .lineTo(x2, y)
        .lineWidth(1.6)
        .strokeColor(COLORS.ink)
        .stroke();
      doc.lineWidth(1);
    }

    function hairline(y: number, x1 = 48, x2 = 564) {
      doc
        .moveTo(x1, y)
        .lineTo(x2, y)
        .lineWidth(0.7)
        .strokeColor(COLORS.line)
        .stroke();
      doc.lineWidth(1);
    }

    // Header: logo + invoice identity
    doc.image(logoImage, 48, 38, { fit: [58, 58] });
    doc
      .fontSize(9.5)
      .fillColor(COLORS.ink)
      .text(`Invoice ${invoice.invoice_number}`, 348, 50, {
        align: "right",
        width: 216,
      })
      .fontSize(7)
      .fillColor(COLORS.muted)
      .text("Visual Square LLC · Palisades Park, NJ", 348, 65, {
        align: "right",
        width: 216,
      });

    strongRule(112);

    // Meta grid: billed to / project / dates / total due
    doc
      .fontSize(6)
      .fillColor(COLORS.faint)
      .text("BILLED TO", 48, 128, { characterSpacing: 1.5 })
      .text("PROJECT", 178, 128, { characterSpacing: 1.5 })
      .text("DATES", 308, 128, { characterSpacing: 1.5 })
      .text("TOTAL DUE", 444, 128, {
        characterSpacing: 1.5,
        width: 120,
        align: "right",
      });

    doc
      .fontSize(8.5)
      .fillColor(COLORS.ink)
      .text(recipient.name, 48, 142, { width: 122 });
    doc
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(recipient.address || recipient.email || "-", 48, 154, {
        width: 122,
        lineGap: 1.5,
      });

    doc
      .fontSize(8.5)
      .fillColor(COLORS.ink)
      .text(invoice.projects?.name ?? "-", 178, 142, { width: 122 });

    doc
      .fontSize(8.5)
      .fillColor(COLORS.ink)
      .text(`Issued ${formatUsDate(invoice.issue_date)}`, 308, 142, {
        width: 128,
      })
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(`Due ${formatUsDate(invoice.due_date)}`, 308, 154, { width: 128 });

    doc
      .fontSize(14)
      .fillColor(COLORS.coral)
      .text(formatCurrency(toNumber(invoice.total)), 414, 140, {
        width: 150,
        align: "right",
      });

    // Line items
    let y = 226;
    strongRule(y - 14);
    doc.fontSize(6).fillColor(COLORS.faint);
    doc.text("DESCRIPTION", 48, y - 6, { characterSpacing: 1.5 });
    doc.text("QTY", 360, y - 6, {
      width: 36,
      align: "right",
      characterSpacing: 1.5,
    });
    doc.text("UNIT", 420, y - 6, {
      width: 54,
      align: "right",
      characterSpacing: 1.5,
    });
    doc.text("AMOUNT", 504, y - 6, {
      width: 60,
      align: "right",
      characterSpacing: 1.5,
    });

    y += 12;
    lines.forEach((line) => {
      hairline(y - 2);
      doc
        .fontSize(8.5)
        .fillColor(COLORS.ink)
        .text(line.description, 48, y + 8, { width: 290 });
      doc
        .fillColor(COLORS.muted)
        .text(String(line.quantity), 360, y + 8, { width: 36, align: "right" })
        .text(formatCurrency(line.unitPrice), 420, y + 8, {
          width: 54,
          align: "right",
        });
      doc
        .fillColor(COLORS.ink)
        .text(formatCurrency(line.amount), 504, y + 8, {
          width: 60,
          align: "right",
        });
      y += 30;
    });
    hairline(y + 2);

    // Totals
    const totalsTop = y + 20;
    const tax = toNumber(invoice.tax);
    const taxLabel = tax > 0 ? "Tax (NJ 6.625%)" : "Tax";
    [
      ["Subtotal", formatCurrency(toNumber(invoice.subtotal))],
      [taxLabel, formatCurrency(tax)],
    ].forEach(([label, value], index) => {
      doc
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .text(label, 414, totalsTop + index * 16);
      doc
        .fillColor(COLORS.ink)
        .text(value, 504, totalsTop + index * 16, { width: 60, align: "right" });
    });
    doc
      .moveTo(414, totalsTop + 38)
      .lineTo(564, totalsTop + 38)
      .lineWidth(1.2)
      .strokeColor(COLORS.ink)
      .stroke();
    doc.lineWidth(1);
    doc
      .fontSize(9.5)
      .fillColor(COLORS.ink)
      .text("Total", 414, totalsTop + 46)
      .text(formatCurrency(toNumber(invoice.total)), 474, totalsTop + 46, {
        width: 90,
        align: "right",
      });

    // Payment instructions
    const paymentY = Math.max(totalsTop + 110, 580);
    strongRule(paymentY - 12);
    doc
      .fontSize(6)
      .fillColor(COLORS.faint)
      .text("PAYMENT", 48, paymentY, { characterSpacing: 1.5 });
    paymentInstructions.forEach((instruction, index) => {
      const columnX = 48 + index * 140;
      doc
        .fontSize(8)
        .fillColor(COLORS.ink)
        .text(instruction.label, columnX, paymentY + 14, {
          width: 130,
          lineBreak: false,
        });
      instruction.lines.forEach((line, lineIndex) => {
        doc
          .fontSize(7)
          .fillColor(COLORS.muted)
          .text(line, columnX, paymentY + 27 + lineIndex * 10, {
            width: 130,
            lineBreak: false,
          });
      });
    });
    doc.image(venmoQrImage, 506, paymentY + 4, { fit: [54, 54] });
    doc
      .fontSize(7)
      .fillColor(COLORS.coral)
      .text(buildPaymentMemoNote(invoice.invoice_number), 48, paymentY + 64, {
        width: 420,
        lineBreak: false,
      });

    doc
      .fontSize(7)
      .fillColor(COLORS.faint)
      .text("Visual Square — Thank you for your business.", 48, 724, {
        lineBreak: false,
      });

    doc.end();
  });
}
