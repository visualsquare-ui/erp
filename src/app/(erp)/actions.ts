"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  calculateInvoiceDraft,
  isExtraRevision,
  roundMoney,
  toNumber,
} from "@/lib/erp-calculations";
import {
  buildGeneratedPurchaseOrderNumber,
  buildGeneratedVendorBillNumber,
  getDateNumberToken,
  getVendorCode,
} from "@/lib/document-numbering";
import { addPaymentTermDays, type PaymentTerms } from "@/lib/format";
import { optionalFormText } from "@/lib/form-values";
import { getAuthedSupabase } from "@/lib/erp-data";
import type { ProjectType } from "@/lib/project-rules";
import { getInvoiceItemSchemaHint } from "@/lib/supabase-schema-errors";
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

type AuthedSupabaseClient = Awaited<
  ReturnType<typeof getAuthedSupabase>
>["supabase"];

type PurchaseOrderItemInput = {
  clientId: string | null;
  jobId: string | null;
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

type InvoiceItemInput = {
  purchaseOrderId: string | null;
  jobId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  isTaxable: boolean;
  taxRate: number;
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

function parseInvoiceItems(formData: FormData): InvoiceItemInput[] {
  const rawItems = text(formData, "invoice_items_json");

  if (!rawItems) {
    return [
      {
        purchaseOrderId: null,
        jobId: null,
        description: text(formData, "description") ?? "Design service",
        quantity: toNumber(text(formData, "quantity")) || 1,
        unitPrice: money(formData, "unit_price"),
        isTaxable: checkbox(formData, "is_taxable"),
        taxRate: toNumber(text(formData, "tax_rate")),
      },
    ];
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
          const source = item as Partial<InvoiceItemInput>;

          return {
            purchaseOrderId:
              String(source.purchaseOrderId ?? "").trim() || null,
            jobId: String(source.jobId ?? "").trim() || null,
            description:
              String(source.description ?? "").trim() || "Design service",
            quantity: toNumber(source.quantity) || 1,
            unitPrice: toNumber(source.unitPrice),
            isTaxable: Boolean(source.isTaxable),
            taxRate: toNumber(source.taxRate),
          };
        })
        .filter((item) => item.description && item.quantity > 0)
    : [];

  return items.length > 0 ? items : parseInvoiceItems(new FormData());
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
            jobId: String(source.jobId ?? "").trim() || null,
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

async function generateVendorBillNumber({
  supabase,
  vendorId,
  receivedDate,
  currentBillId,
}: {
  supabase: AuthedSupabaseClient;
  vendorId: string;
  receivedDate: string;
  currentBillId?: string | null;
}) {
  const { data: vendor } = await supabase
    .from("vendors")
    .select("name")
    .eq("id", vendorId)
    .single();
  const vendorName = vendor?.name ?? vendorId;
  const prefix = `${getVendorCode(vendorName)}-${getDateNumberToken(
    receivedDate,
  )}`;
  const { data: existingBills } = await supabase
    .from("vendor_bills")
    .select("id,bill_number")
    .eq("vendor_id", vendorId)
    .eq("received_date", receivedDate);
  const comparableBills = (existingBills ?? []).filter(
    (bill) => bill.id !== currentBillId,
  );
  const maxGeneratedSequence = comparableBills.reduce((max, bill) => {
    const suffix = String(bill.bill_number ?? "").match(
      new RegExp(`^${prefix}-(\\d{2})$`),
    )?.[1];

    return Math.max(max, suffix ? Number(suffix) : 0);
  }, 0);
  const sequence = Math.max(maxGeneratedSequence, comparableBills.length) + 1;

  return buildGeneratedVendorBillNumber({
    vendorName,
    receivedDate,
    sequence,
  });
}

async function generatePurchaseOrderNumber({
  supabase,
  orderDate,
  currentOrderId,
}: {
  supabase: AuthedSupabaseClient;
  orderDate: string;
  currentOrderId?: string | null;
}) {
  const { data: existingOrders } = await supabase
    .from("purchase_orders")
    .select("id,po_number")
    .eq("order_date", orderDate);
  const comparableOrders = (existingOrders ?? []).filter(
    (order) => order.id !== currentOrderId,
  );
  const prefix = `PO-${getDateNumberToken(orderDate)}`;
  const maxGeneratedSequence = comparableOrders.reduce((max, order) => {
    const suffix = String(order.po_number ?? "").match(
      new RegExp(`^${prefix}-(\\d{2})$`),
    )?.[1];

    return Math.max(max, suffix ? Number(suffix) : 0);
  }, 0);
  const sequence = Math.max(maxGeneratedSequence, comparableOrders.length) + 1;

  return buildGeneratedPurchaseOrderNumber({
    orderDate,
    sequence,
  });
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

export async function createJobAction(formData: FormData) {
  const { supabase } = await getAuthedSupabase("/jobs");
  const clientId = text(formData, "client_id");

  if (!clientId) {
    throw new Error("Job을 저장하려면 Client를 선택해야 합니다.");
  }

  const { error } = await supabase.from("jobs").insert({
    client_id: clientId,
    project_id: text(formData, "project_id"),
    name: text(formData, "name") ?? "Untitled job",
    type: (text(formData, "type") ?? "print") as ProjectType,
    status: (text(formData, "status") ?? "quote") as ProjectStatus,
    start_date: text(formData, "start_date"),
    due_date: text(formData, "due_date"),
    description: text(formData, "description"),
    quote_amount: money(formData, "quote_amount"),
  });

  if (error) {
    throw new Error(`Job 저장 실패: ${error.message}`);
  }

  revalidatePath("/jobs");
  revalidatePath("/purchasing");
  revalidatePath("/clients");
  revalidatePath("/");
}

export async function updateJobAction(formData: FormData) {
  const jobId = text(formData, "job_id");
  const clientId = text(formData, "client_id");

  if (!jobId) {
    return;
  }

  if (!clientId) {
    throw new Error("Job을 수정하려면 Client를 선택해야 합니다.");
  }

  const { supabase } = await getAuthedSupabase("/jobs");
  const { error } = await supabase
    .from("jobs")
    .update({
      client_id: clientId,
      project_id: text(formData, "project_id"),
      name: text(formData, "name") ?? "Untitled job",
      type: (text(formData, "type") ?? "print") as ProjectType,
      status: (text(formData, "status") ?? "quote") as ProjectStatus,
      start_date: text(formData, "start_date"),
      due_date: text(formData, "due_date"),
      description: text(formData, "description"),
      quote_amount: money(formData, "quote_amount"),
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(`Job 수정 실패: ${error.message}`);
  }

  revalidatePath("/jobs");
  revalidatePath("/purchasing");
  revalidatePath("/clients");
  revalidatePath("/");
}

export async function deleteJobAction(formData: FormData) {
  const jobId = text(formData, "job_id");

  if (!jobId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/jobs");
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) {
    throw new Error(`Job 삭제 실패: ${error.message}`);
  }

  revalidatePath("/jobs");
  revalidatePath("/purchasing");
  revalidatePath("/clients");
  revalidatePath("/");
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
  const projectId = text(formData, "project_id");
  const returnPath = text(formData, "return_path") ?? "/purchasing";
  const orderItems = parsePurchaseOrderItems(formData);
  const { supabase } = await getAuthedSupabase(returnPath);
  const orderDate = text(formData, "order_date") ?? todayIso();
  const poNumber =
    text(formData, "po_number") ??
    (await generatePurchaseOrderNumber({ supabase, orderDate }));
  const { error } = await supabase.from("purchase_orders").insert({
    project_id: projectId,
    vendor_id: text(formData, "vendor_id"),
    po_number: poNumber,
    order_date: orderDate,
    expected_date: text(formData, "expected_date"),
    spec: orderItems.spec,
    amount: orderItems.total,
    status: text(formData, "status") ?? "ordered",
  });

  if (error) {
    throw new Error(`PO 저장 실패: ${error.message}`);
  }

  revalidatePath("/purchasing");
  revalidatePath("/jobs");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}

export async function updatePurchaseOrderAction(formData: FormData) {
  const orderId = text(formData, "purchase_order_id");
  const projectId = text(formData, "project_id");

  if (!orderId) {
    return;
  }

  const orderItems = parsePurchaseOrderItems(formData);
  const { supabase } = await getAuthedSupabase("/purchasing");
  const orderDate = text(formData, "order_date") ?? todayIso();
  const poNumber =
    text(formData, "po_number") ??
    (await generatePurchaseOrderNumber({
      supabase,
      orderDate,
      currentOrderId: orderId,
    }));
  const { error } = await supabase
    .from("purchase_orders")
    .update({
      project_id: projectId,
      vendor_id: text(formData, "vendor_id"),
      po_number: poNumber,
      order_date: orderDate,
      expected_date: text(formData, "expected_date"),
      spec: orderItems.spec,
      amount: orderItems.total,
      status: text(formData, "status") ?? "ordered",
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(`PO 수정 실패: ${error.message}`);
  }

  revalidatePath("/purchasing");
  revalidatePath("/jobs");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
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
  const projectId = text(formData, "project_id");
  const returnPath = text(formData, "return_path") ?? "/purchasing";
  const status = text(formData, "status") ?? "received";
  const vendorId = text(formData, "vendor_id");
  const receivedDate = text(formData, "received_date") ?? todayIso();

  if (!vendorId) {
    throw new Error("Bill을 저장하려면 Vendor를 선택해야 합니다.");
  }

  const { supabase } = await getAuthedSupabase(returnPath);
  const billNumber =
    text(formData, "bill_number") ??
    (await generateVendorBillNumber({
      supabase,
      vendorId,
      receivedDate,
    }));
  const { error } = await supabase.from("vendor_bills").insert({
    project_id: projectId,
    vendor_id: vendorId,
    purchase_order_id: text(formData, "purchase_order_id"),
    bill_number: billNumber,
    received_date: receivedDate,
    due_date: text(formData, "due_date"),
    amount: money(formData, "amount"),
    status,
    paid_date: status === "paid" ? text(formData, "paid_date") ?? todayIso() : null,
    file_url: text(formData, "file_url"),
  });

  if (error) {
    throw new Error(`Bill 저장 실패: ${error.message}`);
  }

  revalidatePath("/purchasing");
  revalidatePath("/jobs");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}

export async function updateVendorBillAction(formData: FormData) {
  const billId = text(formData, "vendor_bill_id");
  const projectId = text(formData, "project_id");
  const status = text(formData, "status") ?? "received";
  const vendorId = text(formData, "vendor_id");
  const receivedDate = text(formData, "received_date") ?? todayIso();

  if (!billId) {
    return;
  }

  if (!vendorId) {
    throw new Error("Bill을 수정하려면 Vendor를 선택해야 합니다.");
  }

  const { supabase } = await getAuthedSupabase("/purchasing");
  const billNumber =
    text(formData, "bill_number") ??
    (await generateVendorBillNumber({
      supabase,
      vendorId,
      receivedDate,
      currentBillId: billId,
    }));
  const { error } = await supabase
    .from("vendor_bills")
    .update({
      project_id: projectId,
      vendor_id: vendorId,
      purchase_order_id: text(formData, "purchase_order_id"),
      bill_number: billNumber,
      received_date: receivedDate,
      due_date: text(formData, "due_date"),
      amount: money(formData, "amount"),
      status,
      paid_date: status === "paid" ? text(formData, "paid_date") ?? todayIso() : null,
      file_url: text(formData, "file_url"),
    })
    .eq("id", billId);

  if (error) {
    throw new Error(`Bill 수정 실패: ${error.message}`);
  }

  revalidatePath("/purchasing");
  revalidatePath("/jobs");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}

export async function updateVendorBillPaymentStatusAction(formData: FormData) {
  const billId = text(formData, "vendor_bill_id");
  const projectId = text(formData, "project_id");
  const status = text(formData, "status") ?? "received";

  if (!billId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/purchasing");
  const { error } = await supabase
    .from("vendor_bills")
    .update({
      status,
      paid_date: status === "paid" ? todayIso() : null,
    })
    .eq("id", billId);

  if (error) {
    throw new Error(`Bill payment status 수정 실패: ${error.message}`);
  }

  revalidatePath("/purchasing");
  revalidatePath("/jobs");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
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
  const projectId = optionalFormText(formData, "project_id");
  const returnPath = text(formData, "return_path") ?? "/invoices";
  const issueDate = text(formData, "issue_date") ?? todayIso();
  const terms = (text(formData, "terms") ?? "net_30") as PaymentTerms;
  const invoiceItems = parseInvoiceItems(formData);
  const draft = calculateInvoiceDraft(
    invoiceItems.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      isTaxable: item.isTaxable,
      taxRate: item.taxRate,
    })),
  );
  const { supabase } = await getAuthedSupabase(returnPath);
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true });
  const invoiceNumber =
    text(formData, "invoice_number") ??
    `VS-${issueDate.slice(0, 4)}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data, error: invoiceError } = await supabase
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

  if (invoiceError) {
    throw new Error(`Invoice 저장 실패: ${invoiceError.message}`);
  }

  if (data?.id) {
    const { error: itemError } = await supabase.from("invoice_items").insert(
      invoiceItems.map((item) => ({
        invoice_id: data.id,
        purchase_order_id: item.purchaseOrderId,
        job_id: item.jobId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        amount: roundMoney(item.quantity * item.unitPrice),
        is_taxable: item.isTaxable,
        tax_rate: item.taxRate,
      })),
    );

    if (itemError) {
      await supabase.from("invoices").delete().eq("id", data.id);
      throw new Error(
        `Invoice item 저장 실패: ${itemError.message}${getInvoiceItemSchemaHint(
          itemError.message,
        )}`,
      );
    }
  }

  revalidatePath("/invoices");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}

export async function updateInvoiceAction(formData: FormData) {
  const invoiceId = text(formData, "invoice_id");
  const projectId = optionalFormText(formData, "project_id");
  const issueDate = text(formData, "issue_date") ?? todayIso();
  const terms = (text(formData, "terms") ?? "net_30") as PaymentTerms;
  const invoiceItems = parseInvoiceItems(formData);
  const draft = calculateInvoiceDraft(
    invoiceItems.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      isTaxable: item.isTaxable,
      taxRate: item.taxRate,
    })),
  );

  if (!invoiceId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/invoices");
  const { error: invoiceError } = await supabase
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

  if (invoiceError) {
    throw new Error(`Invoice 수정 실패: ${invoiceError.message}`);
  }

  const { error: deleteItemsError } = await supabase
    .from("invoice_items")
    .delete()
    .eq("invoice_id", invoiceId);

  if (deleteItemsError) {
    throw new Error(`Invoice item 삭제 실패: ${deleteItemsError.message}`);
  }

  const { error: insertItemsError } = await supabase.from("invoice_items").insert(
    invoiceItems.map((item) => ({
      invoice_id: invoiceId,
      purchase_order_id: item.purchaseOrderId,
      job_id: item.jobId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      amount: roundMoney(item.quantity * item.unitPrice),
      is_taxable: item.isTaxable,
      tax_rate: item.taxRate,
    })),
  );

  if (insertItemsError) {
    throw new Error(
      `Invoice item 수정 실패: ${
        insertItemsError.message
      }${getInvoiceItemSchemaHint(insertItemsError.message)}`,
    );
  }

  revalidatePath("/invoices");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
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

export async function createBankAccountAction(formData: FormData) {
  const { supabase } = await getAuthedSupabase("/accounting");
  const { error } = await supabase.from("bank_accounts").insert({
    name: text(formData, "name") ?? "New account",
    institution: text(formData, "institution"),
    account_type: text(formData, "account_type") ?? "checking",
    last4: text(formData, "last4"),
    starting_balance: money(formData, "starting_balance"),
    opened_date: text(formData, "opened_date"),
    memo: text(formData, "memo"),
  });

  if (error) {
    throw new Error(`계좌 저장 실패: ${error.message}`);
  }

  revalidatePath("/accounting");
  revalidatePath("/");
}

export async function updateBankAccountAction(formData: FormData) {
  const accountId = text(formData, "bank_account_id");

  if (!accountId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/accounting");
  const { error } = await supabase
    .from("bank_accounts")
    .update({
      name: text(formData, "name") ?? "New account",
      institution: text(formData, "institution"),
      account_type: text(formData, "account_type") ?? "checking",
      last4: text(formData, "last4"),
      starting_balance: money(formData, "starting_balance"),
      opened_date: text(formData, "opened_date"),
      is_active: checkbox(formData, "is_active"),
      memo: text(formData, "memo"),
    })
    .eq("id", accountId);

  if (error) {
    throw new Error(`계좌 수정 실패: ${error.message}`);
  }

  revalidatePath("/accounting");
  revalidatePath("/");
}

export async function deleteBankAccountAction(formData: FormData) {
  const accountId = text(formData, "bank_account_id");

  if (!accountId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/accounting");
  const { error } = await supabase
    .from("bank_accounts")
    .delete()
    .eq("id", accountId);

  if (error) {
    throw new Error(
      `계좌 삭제 실패: 거래 기록이 있는 계좌는 삭제할 수 없습니다. (${error.message})`,
    );
  }

  revalidatePath("/accounting");
  revalidatePath("/");
}

function transactionPayload(formData: FormData) {
  const amount = money(formData, "amount");

  if (amount <= 0) {
    throw new Error("거래 금액은 0보다 커야 합니다.");
  }

  const bankAccountId = text(formData, "bank_account_id");

  if (!bankAccountId) {
    throw new Error("거래를 저장하려면 계좌를 선택해야 합니다.");
  }

  return {
    bank_account_id: bankAccountId,
    txn_date: text(formData, "txn_date") ?? todayIso(),
    type: (text(formData, "type") ?? "expense") as
      | "client_payment"
      | "other_income"
      | "vendor_payment"
      | "expense",
    amount,
    payee: text(formData, "payee"),
    category: text(formData, "category"),
    payment_method: text(formData, "payment_method"),
    description: text(formData, "description"),
    memo: text(formData, "memo"),
    client_id: text(formData, "client_id"),
    vendor_id: text(formData, "vendor_id"),
    invoice_id: text(formData, "invoice_id"),
    vendor_bill_id: text(formData, "vendor_bill_id"),
  };
}

export async function createTransactionAction(formData: FormData) {
  const { supabase } = await getAuthedSupabase("/accounting");
  const { error } = await supabase
    .from("account_transactions")
    .insert(transactionPayload(formData));

  if (error) {
    throw new Error(`거래 저장 실패: ${error.message}`);
  }

  revalidatePath("/accounting");
  revalidatePath("/");
}

export async function updateTransactionAction(formData: FormData) {
  const transactionId = text(formData, "transaction_id");

  if (!transactionId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/accounting");
  const { error } = await supabase
    .from("account_transactions")
    .update(transactionPayload(formData))
    .eq("id", transactionId);

  if (error) {
    throw new Error(`거래 수정 실패: ${error.message}`);
  }

  revalidatePath("/accounting");
  revalidatePath("/");
}

export async function deleteTransactionAction(formData: FormData) {
  const transactionId = text(formData, "transaction_id");

  if (!transactionId) {
    return;
  }

  const { supabase } = await getAuthedSupabase("/accounting");
  const { error } = await supabase
    .from("account_transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    throw new Error(`거래 삭제 실패: ${error.message}`);
  }

  revalidatePath("/accounting");
  revalidatePath("/");
}
