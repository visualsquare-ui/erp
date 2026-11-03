import path from "node:path";
import fs from "node:fs";
import PDFDocument from "pdfkit";

import { toNumber } from "./erp-calculations";
import {
  buildEstimateLineItems,
  formatQuantity,
  getEstimateRecipient,
  type EstimateDocument,
} from "./estimate-document";
import { formatCurrency, formatUsDate } from "./format";

const COLORS = {
  ink: "#141414",
  muted: "#6f6660",
  line: "#e7e2dd",
  coral: "#f57d4b",
};

const LEFT = 48;
const RIGHT = 564;
const PAGE_BOTTOM = 700;

export async function buildEstimatePdf(estimate: EstimateDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 48,
      autoFirstPage: false,
      bufferPages: true,
      info: {
        Title: `Estimate ${estimate.estimate_number}`,
        Author: "Visual Square",
      },
    });
    const recipient = getEstimateRecipient(estimate);
    const lines = buildEstimateLineItems(estimate);
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
    doc.registerFont("VS", fontData);
    doc.font("VS");
    doc.addPage();

    function strongRule(y: number, x1 = LEFT, x2 = RIGHT) {
      doc
        .moveTo(x1, y)
        .lineTo(x2, y)
        .lineWidth(1.6)
        .strokeColor(COLORS.ink)
        .stroke();
      doc.lineWidth(1);
    }

    function hairline(y: number, x1 = LEFT, x2 = RIGHT) {
      doc
        .moveTo(x1, y)
        .lineTo(x2, y)
        .lineWidth(0.7)
        .strokeColor(COLORS.line)
        .stroke();
      doc.lineWidth(1);
    }

    function itemHeader(y: number) {
      strongRule(y - 14);
      doc.fontSize(6).fillColor(COLORS.muted);
      doc.text("DESCRIPTION", LEFT, y - 6, { characterSpacing: 1.5 });
      doc.text("QTY", 360, y - 6, {
        width: 36,
        align: "right",
        characterSpacing: 1.5,
      });
      doc.text("UNIT", 410, y - 6, {
        width: 64,
        align: "right",
        characterSpacing: 1.5,
      });
      doc.text("AMOUNT", 494, y - 6, {
        width: 70,
        align: "right",
        characterSpacing: 1.5,
      });
    }

    // Header: logo + estimate identity
    doc.image(logoImage, LEFT, 32, { fit: [87, 87] });
    doc
      .fontSize(9.5)
      .fillColor(COLORS.ink)
      .text(`Estimate ${estimate.estimate_number}`, 348, 56, {
        align: "right",
        width: 216,
      })
      .fontSize(7)
      .fillColor(COLORS.muted)
      .text("Visual Square · Design & Print", 348, 71, {
        align: "right",
        width: 216,
      });

    strongRule(128);

    // Meta grid: prepared for / job / dates / estimate total
    doc
      .fontSize(6)
      .fillColor(COLORS.muted)
      .text("PREPARED FOR", LEFT, 144, { characterSpacing: 1.5 })
      .text("JOB", 178, 144, { characterSpacing: 1.5 })
      .text("DATES", 308, 144, { characterSpacing: 1.5 })
      .text("ESTIMATE TOTAL", 424, 144, {
        characterSpacing: 1.5,
        width: 140,
        align: "right",
      });

    doc
      .fontSize(8.5)
      .fillColor(COLORS.ink)
      .text(recipient.name, LEFT, 158, { width: 122 });
    const recipientDetails = [
      recipient.contact ? `Attn. ${recipient.contact}` : "",
      recipient.email,
      recipient.address,
    ].filter(Boolean);
    doc
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(recipientDetails.join("\n") || "-", LEFT, 170, {
        width: 122,
        lineGap: 1.5,
      });

    doc
      .fontSize(8.5)
      .fillColor(COLORS.ink)
      .text(estimate.jobs?.name ?? "-", 178, 158, { width: 122 });

    doc
      .fontSize(8.5)
      .fillColor(COLORS.ink)
      .text(`Issued ${formatUsDate(estimate.issue_date)}`, 308, 158, {
        width: 128,
      });
    if (estimate.valid_until) {
      doc
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .text(`Valid until ${formatUsDate(estimate.valid_until)}`, 308, 170, {
          width: 128,
        });
    }

    doc
      .fontSize(14)
      .fillColor(COLORS.coral)
      .text(formatCurrency(toNumber(estimate.total)), 414, 156, {
        width: 150,
        align: "right",
      });

    // Line items (descriptions wrap, so each row is sized to its text)
    let y = 242;
    itemHeader(y);
    y += 12;

    lines.forEach((line) => {
      doc.fontSize(8.5);
      const textHeight = doc.heightOfString(line.description, { width: 290 });
      const rowHeight = Math.max(30, textHeight + 18);

      if (y + rowHeight > PAGE_BOTTOM) {
        doc.addPage();
        y = 80;
        itemHeader(y);
        y += 12;
      }

      hairline(y - 2);
      doc
        .fontSize(8.5)
        .fillColor(COLORS.ink)
        .text(line.description, LEFT, y + 8, { width: 290 });
      doc
        .fillColor(COLORS.muted)
        .text(formatQuantity(line.quantity), 360, y + 8, {
          width: 36,
          align: "right",
        })
        .text(formatCurrency(line.unitPrice), 410, y + 8, {
          width: 64,
          align: "right",
        });
      doc
        .fillColor(COLORS.ink)
        .text(formatCurrency(line.amount), 494, y + 8, {
          width: 70,
          align: "right",
        });
      y += rowHeight;
    });
    hairline(y + 2);

    // Totals
    if (y + 110 > PAGE_BOTTOM) {
      doc.addPage();
      y = 60;
    }
    const totalsTop = y + 20;
    const tax = toNumber(estimate.tax);
    const taxLabel = tax > 0 ? "Tax (NJ 6.625%)" : "Tax";
    [
      ["Subtotal", formatCurrency(toNumber(estimate.subtotal))],
      [taxLabel, formatCurrency(tax)],
    ].forEach(([label, value], index) => {
      doc
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .text(label, 414, totalsTop + index * 16);
      doc
        .fillColor(COLORS.ink)
        .text(value, 494, totalsTop + index * 16, { width: 70, align: "right" });
    });
    doc
      .moveTo(414, totalsTop + 38)
      .lineTo(RIGHT, totalsTop + 38)
      .lineWidth(1.2)
      .strokeColor(COLORS.ink)
      .stroke();
    doc.lineWidth(1);
    doc
      .fontSize(9.5)
      .fillColor(COLORS.ink)
      .text("Total", 414, totalsTop + 46)
      .text(formatCurrency(toNumber(estimate.total)), 474, totalsTop + 46, {
        width: 90,
        align: "right",
      });

    // Notes
    const notes = (estimate.notes ?? "").trim();
    if (notes) {
      doc.fontSize(8);
      const notesHeight = doc.heightOfString(notes, {
        width: RIGHT - LEFT,
        lineGap: 2,
      });
      let notesY = totalsTop + 90;

      if (notesY + notesHeight + 30 > PAGE_BOTTOM + 20) {
        doc.addPage();
        notesY = 60;
      }

      strongRule(notesY - 12);
      doc
        .fontSize(6)
        .fillColor(COLORS.muted)
        .text("NOTES", LEFT, notesY, { characterSpacing: 1.5 });
      doc
        .fontSize(8)
        .fillColor(COLORS.ink)
        .text(notes, LEFT, notesY + 14, { width: RIGHT - LEFT, lineGap: 2 });
    }

    // Footer on every page
    const range = doc.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
      doc.switchToPage(index);
      doc
        .fontSize(7)
        .fillColor(COLORS.muted)
        .text(
          "Visual Square · Thank you for the opportunity.",
          LEFT,
          724,
          { lineBreak: false },
        );
    }

    doc.end();
  });
}
