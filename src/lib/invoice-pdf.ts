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
import { getInvoicePaymentLinks } from "./payment-links";

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
    const paymentLinks = getInvoicePaymentLinks();
    const logoPath = path.join(process.cwd(), "assets", "vs-logo-transparent.png");
    const logoImage = fs.readFileSync(logoPath);
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
    doc.registerFont("VSRegular", fontData);
    doc.registerFont("VSBold", fontData);
    doc.addPage();

    doc.image(logoImage, 44, 38, {
      fit: [96, 96],
      align: "center",
      valign: "center",
    });

    doc
      .font("VSBold")
      .fontSize(11)
      .fillColor("#f57d4b")
      .text("INVOICE", 390, 52, { align: "right", width: 156 })
      .fontSize(13)
      .fillColor("#141414")
      .text(invoice.invoice_number, 330, 76, { align: "right", width: 216 });

    doc.moveTo(48, 124).lineTo(564, 124).strokeColor("#e7e2dd").stroke();

    doc
      .font("VSBold")
      .fontSize(10)
      .fillColor("#6f6660")
      .text("BILL TO", 48, 154)
      .font("VSBold")
      .fontSize(13)
      .fillColor("#141414")
      .text(recipient.name, 48, 174)
      .font("VSRegular")
      .fontSize(10)
      .fillColor("#6f6660")
      .text(recipient.address || recipient.email || "-", 48, 194, {
        width: 230,
      });

    doc
      .font("VSRegular")
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
    const tableLeft = 48;
    const columns = {
      description: { x: 60, width: 276 },
      quantity: { x: 348, width: 42 },
      unit: { x: 410, width: 58 },
      amount: { x: 486, width: 60 },
    };

    doc.rect(48, y - 24, 516, 28).fill("#fbf6f3");
    doc
      .font("VSBold")
      .fontSize(9)
      .fillColor("#6f6660")
      .text("DESCRIPTION", columns.description.x, y - 15, {
        width: columns.description.width,
      })
      .text("QTY", columns.quantity.x, y - 15, {
        width: columns.quantity.width,
        align: "right",
      })
      .text("UNIT", columns.unit.x, y - 15, {
        width: columns.unit.width,
        align: "right",
      })
      .text("AMOUNT", columns.amount.x, y - 15, {
        width: columns.amount.width,
        align: "right",
      });

    doc.font("VSRegular").fontSize(10).fillColor("#141414");
    lines.forEach((line) => {
      const rowTop = y + 10;
      doc
        .moveTo(48, rowTop - 8)
        .lineTo(564, rowTop - 8)
        .strokeColor("#e7e2dd")
        .stroke();
      doc
        .fillColor("#141414")
        .text(line.description, columns.description.x, rowTop, {
          width: columns.description.width,
        })
        .text(String(line.quantity), columns.quantity.x, rowTop, {
          width: columns.quantity.width,
          align: "right",
        })
        .text(formatCurrency(line.unitPrice), columns.unit.x, rowTop, {
          width: columns.unit.width,
          align: "right",
        })
        .text(formatCurrency(line.amount), columns.amount.x, rowTop, {
          width: columns.amount.width,
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
        .font(index === 2 ? "VSBold" : "VSRegular")
        .fontSize(index === 2 ? 12 : 10)
        .fillColor(index === 2 ? "#141414" : "#6f6660")
        .text(String(label), 390, rowY)
        .fillColor("#141414")
        .text(formatCurrency(Number(value)), 486, rowY, {
          width: 60,
          align: "right",
        });
    });

    const paymentY = Math.max(totalTop + 88, 500);
    if (paymentLinks.length > 0) {
      doc
        .font("VSBold")
        .fontSize(9)
        .fillColor("#6f6660")
        .text("PAYMENT OPTIONS", tableLeft, paymentY, { lineBreak: false });

      paymentLinks.forEach((link, index) => {
        const columnWidth = 158;
        const columnX = tableLeft + index * 174;
        const rowY = paymentY + 22;
        doc
          .font("VSBold")
          .fontSize(10)
          .fillColor("#141414")
          .text(link.label, columnX, rowY, {
            width: columnWidth,
            link: link.href,
            underline: true,
            lineBreak: false,
          })
          .font("VSRegular")
          .fillColor("#6f6660")
          .text(link.method, columnX, rowY + 15, {
            width: columnWidth,
            lineBreak: false,
          });
      });
    }

    doc
      .rect(48, 700, 516, 6)
      .fill("#f57d4b")
      .font("VSRegular")
      .fontSize(9)
      .fillColor("#6f6660")
      .text("Visual Square", 48, 718, { lineBreak: false })
      .text("Thank you for your business.", 390, 718, {
        width: 174,
        align: "right",
        lineBreak: false,
      });

    doc.end();
  });
}
