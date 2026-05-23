"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  calculateInvoiceDraft,
  isExtraRevision,
  roundMoney,
  toNumber,
} from "@/lib/erp-calculations";
import { addPaymentTermDays, type PaymentTerms } from "@/lib/format";
import { getAuthedSupabase } from "@/lib/erp-data";
import type { ProjectType } from "@/lib/project-rules";
import type { ProjectStatus, TaskStatus } from "@/types/erp";

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : null;
}

function money(formData: FormData, key: string): number {
  return toNumber(text(formData, key));
}

function checkbox(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type PurchaseOrderItemInput = {
  clientId: string | null;
  item: string;
  unitPrice: number;
  qty: number;
};

type PurchaseOrderSpec = {
  items?: PurchaseOrderItemInput[];
  meta?: {
    deletedAt?: string;
    previousStatus?: string;
  };
};

function parsePurchaseOrderSpec(value: string | null): PurchaseOrderSpec {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as PurchaseOrderSpec;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function parsePurchaseOrderItems(formData: FormData): {
  items: PurchaseOrderItemInput[];
  total: number;
  spec: string | null;
} {
  const rawItems = text(formData, "po_items_json");

  if (!rawItems) {
    return {
      items: [],
      total: money(formData, "amount"),
      spec: text(formData, "spec"),
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawItems);
  } catch {
    parsed = [];
  }

  const items = Array.isArray(parsed)
    ? parsed
        .map((item) => {
          const source = item as Partial<PurchaseOrderItemInput>;

          return {
            clientId: String(source.clientId ?? "").trim() || null,
            item: String(source.item ?? "").trim(),
            unitPrice: toNumber(source.unitPrice),
            qty: toNumber(source.qty) || 1,
          };
        })
        .filter((item) => item.item && item.unitPrice >= 0 && item.qty > 0)
    : [];

  const total = roundMoney(
    items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),
  );

  return {
    items,
    total,
    spec: JSON.stringify({ items }),
  };
}

export async function createClientAction(formData: FormData) {
  const { supabase } = await getAuthedSupabase("/clients");
  await supabase.from("clients").insert({
    name: text(formData, "name") ?? "New contact",
    company_name: text(formData, "company_name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    address: text(formData, "address"),
    memo: text(formData, "memo"),
  });
  revalidatePath("/clients");
  revalidatePath("/");
}

export async function updateClientAction(formData: FormData) {
  const clientId = text(formData, "client_id");

  if (!clientId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/clients");
  await supabase
    .from("clients")
    .update({
      name: text(formData, "name") ?? "New contact",
      company_name: text(formData, "company_name"),
      email: text(formData, "email"),
      phone: text(formData, "phone"),
      address: text(formData, "address"),
      memo: text(formData, "memo"),
    })
    .eq("id", clientId);

  revalidatePath("/clients");
  revalidatePath("/");
}

export async function deleteClientAction(formData: FormData) {
  const clientId = text(formData, "client_id");

  if (!clientId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/clients");
  await supabase.from("clients").delete().eq("id", clientId);

  revalidatePath("/clients");
  revalidatePath("/");
}

export async function createProjectAction(formData: FormData) {
  const { supabase } = await getAuthedSupabase("/projects");
  const { data } = await supabase
    .from("projects")
    .insert({
      client_id: text(formData, "client_id"),
      name: text(formData, "name") ?? "Untitled project",
      type: (text(formData, "type") ?? "print") as ProjectType,
      status: (text(formData, "status") ?? "quote") as ProjectStatus,
      start_date: text(formData, "start_date"),
      due_date: text(formData, "due_date"),
      description: text(formData, "description"),
      quote_amount: money(formData, "quote_amount"),
    })
    .select("id")
    .single();

  revalidatePath("/projects");
  revalidatePath("/");

  if (data?.id) {
    redirect(`/projects/${data.id}`);
  }
}

export async function createTaskAction(formData: FormData) {
  const projectId = String(formData.get("project_id"));
  const { supabase } = await getAuthedSupabase(`/projects/${projectId}`);
  await supabase.from("tasks").insert({
    project_id: projectId,
    title: text(formData, "title") ?? "New task",
    assignee: text(formData, "assignee"),
    status: (text(formData, "status") ?? "todo") as TaskStatus,
    due_date: text(formData, "due_date"),
    sort_order: toNumber(text(formData, "sort_order")),
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function createWorkOrderAction(formData: FormData) {
  const projectId = String(formData.get("project_id"));
  const { supabase } = await getAuthedSupabase(`/projects/${projectId}`);
  await supabase.from("work_orders").insert({
    project_id: projectId,
    spec: text(formData, "spec"),
    requirements: text(formData, "requirements"),
    included_revisions: toNumber(text(formData, "included_revisions")) || 3,
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function createProofVersionAction(formData: FormData) {
  const projectId = String(formData.get("project_id"));
  const workOrderId = String(formData.get("work_order_id"));
  const version = toNumber(text(formData, "version")) || 1;
  const includedRevisions = toNumber(text(formData, "included_revisions")) || 3;
  const approved = checkbox(formData, "client_approved");
  const { supabase } = await getAuthedSupabase(`/projects/${projectId}`);
  await supabase.from("proof_versions").insert({
    work_order_id: workOrderId,
    version,
    file_url: text(formData, "file_url"),
    client_approved: approved,
    approved_at: approved ? new Date().toISOString() : null,
    is_extra_revision: isExtraRevision(version, includedRevisions),
    memo: text(formData, "memo"),
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function createAssetAction(formData: FormData) {
  const projectId = String(formData.get("project_id"));
  const { supabase } = await getAuthedSupabase(`/projects/${projectId}`);
  await supabase.from("assets").insert({
    project_id: projectId,
    work_order_id: text(formData, "work_order_id"),
    kind: text(formData, "kind") ?? "drive_link",
    title: text(formData, "title") ?? "Untitled asset",
    storage_url: text(formData, "storage_url"),
    external_url: text(formData, "external_url"),
    thumbnail_url: text(formData, "thumbnail_url"),
    is_portfolio: checkbox(formData, "is_portfolio"),
    memo: text(formData, "memo"),
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function createVendorAction(formData: FormData) {
  const { supabase } = await getAuthedSupabase("/purchasing");
  await supabase.from("vendors").insert({
    name: text(formData, "name") ?? "New vendor",
    contact_person: text(formData, "contact_person"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    specialty: text(formData, "specialty"),
    memo: text(formData, "memo"),
  });
  revalidatePath("/purchasing");
  revalidatePath("/vendors");
}

export async function updateVendorAction(formData: FormData) {
  const vendorId = text(formData, "vendor_id");

  if (!vendorId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/vendors");
  await supabase
    .from("vendors")
    .update({
      name: text(formData, "name") ?? "New vendor",
      contact_person: text(formData, "contact_person"),
      email: text(formData, "email"),
      phone: text(formData, "phone"),
      specialty: text(formData, "specialty"),
      memo: text(formData, "memo"),
    })
    .eq("id", vendorId);

  revalidatePath("/vendors");
  revalidatePath("/purchasing");
}

export async function deleteVendorAction(formData: FormData) {
  const vendorId = text(formData, "vendor_id");

  if (!vendorId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/vendors");
  await supabase.from("vendors").delete().eq("id", vendorId);

  revalidatePath("/vendors");
  revalidatePath("/purchasing");
}

export async function createPurchaseOrderAction(formData: FormData) {
  const projectId = String(formData.get("project_id"));
  const returnPath = text(formData, "return_path") ?? "/purchasing";
  const orderItems = parsePurchaseOrderItems(formData);
  const { supabase } = await getAuthedSupabase(returnPath);
  await supabase.from("purchase_orders").insert({
    project_id: projectId,
    vendor_id: text(formData, "vendor_id"),
    po_number: text(formData, "po_number") ?? `PO-${Date.now()}`,
    order_date: text(formData, "order_date") ?? todayIso(),
    expected_date: text(formData, "expected_date"),
    spec: orderItems.spec,
    amount: orderItems.total,
    status: text(formData, "status") ?? "ordered",
  });
  revalidatePath("/purchasing");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function updatePurchaseOrderAction(formData: FormData) {
  const orderId = text(formData, "purchase_order_id");
  const projectId = String(formData.get("project_id"));

  if (!orderId) {
    return;
  }

  const orderItems = parsePurchaseOrderItems(formData);
  const { supabase } = await getAuthedSupabase("/purchasing");
  await supabase
    .from("purchase_orders")
    .update({
      project_id: projectId,
      vendor_id: text(formData, "vendor_id"),
      po_number: text(formData, "po_number") ?? `PO-${Date.now()}`,
      order_date: text(formData, "order_date") ?? todayIso(),
      expected_date: text(formData, "expected_date"),
      spec: orderItems.spec,
      amount: orderItems.total,
      status: text(formData, "status") ?? "ordered",
    })
    .eq("id", orderId);

  revalidatePath("/purchasing");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function deletePurchaseOrderAction(formData: FormData) {
  const orderId = text(formData, "purchase_order_id");
  const projectId = text(formData, "project_id");

  if (!orderId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/purchasing");
  const { data: order } = await supabase
    .from("purchase_orders")
    .select("spec, status")
    .eq("id", orderId)
    .single();
  const spec = parsePurchaseOrderSpec(order?.spec ?? null);

  await supabase
    .from("purchase_orders")
    .update({
      spec: JSON.stringify({
        ...spec,
        meta: {
          ...(spec.meta ?? {}),
          deletedAt: new Date().toISOString(),
          previousStatus: order?.status ?? "ordered",
        },
      }),
      status: "canceled",
    })
    .eq("id", orderId);

  revalidatePath("/purchasing");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}

export async function restorePurchaseOrderAction(formData: FormData) {
  const orderId = text(formData, "purchase_order_id");
  const projectId = text(formData, "project_id");

  if (!orderId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/purchasing");
  const { data: order } = await supabase
    .from("purchase_orders")
    .select("spec")
    .eq("id", orderId)
    .single();
  const spec = parsePurchaseOrderSpec(order?.spec ?? null);
  const previousStatus = spec.meta?.previousStatus ?? "ordered";
  const meta = { ...(spec.meta ?? {}) };
  delete meta.deletedAt;
  delete meta.previousStatus;

  await supabase
    .from("purchase_orders")
    .update({
      spec: JSON.stringify({
        ...spec,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
      }),
      status: previousStatus,
    })
    .eq("id", orderId);

  revalidatePath("/purchasing");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}

export async function createVendorBillAction(formData: FormData) {
  const projectId = String(formData.get("project_id"));
  const returnPath = text(formData, "return_path") ?? "/purchasing";
  const { supabase } = await getAuthedSupabase(returnPath);
  await supabase.from("vendor_bills").insert({
    project_id: projectId,
    vendor_id: text(formData, "vendor_id"),
    purchase_order_id: text(formData, "purchase_order_id"),
    bill_number: text(formData, "bill_number"),
    received_date: text(formData, "received_date") ?? todayIso(),
    due_date: text(formData, "due_date"),
    amount: money(formData, "amount"),
    status: text(formData, "status") ?? "received",
    paid_date: text(formData, "paid_date"),
    file_url: text(formData, "file_url"),
  });
  revalidatePath("/purchasing");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function updateVendorBillAction(formData: FormData) {
  const billId = text(formData, "vendor_bill_id");
  const projectId = String(formData.get("project_id"));

  if (!billId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/purchasing");
  await supabase
    .from("vendor_bills")
    .update({
      project_id: projectId,
      vendor_id: text(formData, "vendor_id"),
      purchase_order_id: text(formData, "purchase_order_id"),
      bill_number: text(formData, "bill_number"),
      received_date: text(formData, "received_date") ?? todayIso(),
      due_date: text(formData, "due_date"),
      amount: money(formData, "amount"),
      status: text(formData, "status") ?? "received",
      paid_date: text(formData, "paid_date"),
      file_url: text(formData, "file_url"),
    })
    .eq("id", billId);

  revalidatePath("/purchasing");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function deleteVendorBillAction(formData: FormData) {
  const billId = text(formData, "vendor_bill_id");
  const projectId = text(formData, "project_id");

  if (!billId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/purchasing");
  await supabase.from("vendor_bills").delete().eq("id", billId);

  revalidatePath("/purchasing");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}

export async function createInvoiceAction(formData: FormData) {
  const projectId = String(formData.get("project_id"));
  const returnPath = text(formData, "return_path") ?? "/invoices";
  const issueDate = text(formData, "issue_date") ?? todayIso();
  const terms = (text(formData, "terms") ?? "net_30") as PaymentTerms;
  const quantity = toNumber(text(formData, "quantity")) || 1;
  const unitPrice = money(formData, "unit_price");
  const isTaxable = checkbox(formData, "is_taxable");
  const taxRate = toNumber(text(formData, "tax_rate"));
  const draft = calculateInvoiceDraft([
    { quantity, unitPrice, isTaxable, taxRate },
  ]);
  const { supabase } = await getAuthedSupabase(returnPath);
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true });
  const invoiceNumber =
    text(formData, "invoice_number") ??
    `VS-${issueDate.slice(0, 4)}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data } = await supabase
    .from("invoices")
    .insert({
      project_id: projectId,
      client_id: text(formData, "client_id"),
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      terms,
      due_date: text(formData, "due_date") ?? addPaymentTermDays(issueDate, terms),
      status: text(formData, "status") ?? "draft",
      subtotal: draft.subtotal,
      tax: draft.tax,
      total: draft.total,
      paid_amount: money(formData, "paid_amount"),
      paid_date: text(formData, "paid_date"),
    })
    .select("id")
    .single();

  if (data?.id) {
    await supabase.from("invoice_items").insert({
      invoice_id: data.id,
      description: text(formData, "description") ?? "Design service",
      quantity,
      unit_price: unitPrice,
      amount: draft.subtotal,
      is_taxable: isTaxable,
      tax_rate: taxRate,
    });
  }

  revalidatePath("/invoices");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function updateInvoiceAction(formData: FormData) {
  const invoiceId = text(formData, "invoice_id");
  const invoiceItemId = text(formData, "invoice_item_id");
  const projectId = String(formData.get("project_id"));
  const issueDate = text(formData, "issue_date") ?? todayIso();
  const terms = (text(formData, "terms") ?? "net_30") as PaymentTerms;
  const quantity = toNumber(text(formData, "quantity")) || 1;
  const unitPrice = money(formData, "unit_price");
  const isTaxable = checkbox(formData, "is_taxable");
  const taxRate = toNumber(text(formData, "tax_rate"));
  const draft = calculateInvoiceDraft([
    { quantity, unitPrice, isTaxable, taxRate },
  ]);

  if (!invoiceId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/invoices");
  await supabase
    .from("invoices")
    .update({
      project_id: projectId,
      client_id: text(formData, "client_id"),
      invoice_number: text(formData, "invoice_number") ?? `VS-${Date.now()}`,
      issue_date: issueDate,
      terms,
      due_date:
        text(formData, "due_date") ?? addPaymentTermDays(issueDate, terms),
      status: text(formData, "status") ?? "draft",
      subtotal: draft.subtotal,
      tax: draft.tax,
      total: draft.total,
      paid_amount: money(formData, "paid_amount"),
      paid_date: text(formData, "paid_date"),
    })
    .eq("id", invoiceId);

  const itemPayload = {
    invoice_id: invoiceId,
    description: text(formData, "description") ?? "Design service",
    quantity,
    unit_price: unitPrice,
    amount: draft.subtotal,
    is_taxable: isTaxable,
    tax_rate: taxRate,
  };

  if (invoiceItemId) {
    await supabase
      .from("invoice_items")
      .update(itemPayload)
      .eq("id", invoiceItemId);
  } else {
    await supabase.from("invoice_items").insert(itemPayload);
  }

  revalidatePath("/invoices");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function deleteInvoiceAction(formData: FormData) {
  const invoiceId = text(formData, "invoice_id");
  const projectId = text(formData, "project_id");

  if (!invoiceId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/invoices");
  await supabase.from("invoices").delete().eq("id", invoiceId);

  revalidatePath("/invoices");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}
