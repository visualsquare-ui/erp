// Backfill: link client-payment ledger entries to their invoices and recompute
// invoice paid_amount/status. Fixes payments that were recorded in the
// accounting page with the invoice number typed into the description only
// (invoice_id left null), so the invoice never flipped to "입금완료".
//
// Usage:
//   node scripts/link-invoice-payments.mjs          # dry run (no writes)
//   node scripts/link-invoice-payments.mjs --apply   # apply changes
//
// Requires SUPABASE_SERVICE_ROLE_KEY (RLS restricts writes to authenticated).

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const INVOICE_NUMBER_RE = /VS-\d{4}-\d{4}/i;

function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function roundMoney(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(APPLY ? "MODE: APPLY (writing changes)" : "MODE: DRY RUN (no writes)\n");

  // 1) Find client payments with no linked invoice.
  const { data: orphans, error: orphanErr } = await supabase
    .from("account_transactions")
    .select("id, txn_date, amount, description, payee")
    .eq("type", "client_payment")
    .is("invoice_id", null);

  if (orphanErr) throw orphanErr;

  if (!orphans || orphans.length === 0) {
    console.log("No unlinked client payments found. Nothing to do.");
    return;
  }

  const touchedInvoiceIds = new Set();

  for (const txn of orphans) {
    const text = `${txn.description ?? ""} ${txn.payee ?? ""}`;
    const numberMatch = text.match(INVOICE_NUMBER_RE);

    if (!numberMatch) {
      console.log(
        `- SKIP txn ${txn.id} ($${txn.amount}) — no VS-YYYY-NNNN in "${txn.description ?? ""}"`,
      );
      continue;
    }

    const invoiceNumber = numberMatch[0].toUpperCase();
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("id, invoice_number, total")
      .ilike("invoice_number", invoiceNumber)
      .maybeSingle();

    if (invErr) throw invErr;
    if (!invoice) {
      console.log(
        `- SKIP txn ${txn.id} — no invoice matches ${invoiceNumber}`,
      );
      continue;
    }

    console.log(
      `- LINK txn ${txn.id} ($${txn.amount}) -> ${invoice.invoice_number}`,
    );
    touchedInvoiceIds.add(invoice.id);

    if (APPLY) {
      const { error } = await supabase
        .from("account_transactions")
        .update({ invoice_id: invoice.id })
        .eq("id", txn.id);
      if (error) throw error;
    }
  }

  // 2) Recompute paid_amount/status for every touched invoice.
  for (const invoiceId of touchedInvoiceIds) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, status")
      .eq("id", invoiceId)
      .single();

    const { data: payments } = await supabase
      .from("account_transactions")
      .select("amount, txn_date")
      .eq("invoice_id", invoiceId)
      .eq("type", "client_payment");

    const ledgerPaid = roundMoney(
      (payments ?? []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    );
    const latestDate = (payments ?? [])
      .map((p) => p.txn_date)
      .filter(Boolean)
      .sort()
      .at(-1);
    const status = ledgerPaid >= Number(invoice.total) ? "paid" : invoice.status;

    console.log(
      `  -> ${invoice.invoice_number}: paid_amount=${ledgerPaid}, status=${status}`,
    );

    if (APPLY) {
      const { error } = await supabase
        .from("invoices")
        .update({
          paid_amount: ledgerPaid,
          paid_date: status === "paid" ? latestDate ?? null : null,
          status,
        })
        .eq("id", invoiceId);
      if (error) throw error;
    }
  }

  console.log(
    APPLY
      ? "\nDone. Changes applied."
      : "\nDry run complete. Re-run with --apply to write.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
