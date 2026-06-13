"use client";

import { useState } from "react";
import { Banknote, Paperclip, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createPurchaseOrderAction,
  createTransactionAction,
  createVendorBillAction,
  deletePurchaseOrderAction,
  deleteVendorBillAction,
  restorePurchaseOrderAction,
  updatePurchaseOrderAction,
  updateVendorBillAction,
} from "@/app/(erp)/actions";
import { EmptyState } from "@/components/erp/empty-state";
import { ListActionButton } from "@/components/erp/list-action-button";
import { expenseCategories, paymentMethods } from "@/lib/accounting";
import {
  buildPurchaseOrderDisplayNumbers,
  buildVendorBillDisplayNumbers,
} from "@/lib/document-numbering";
import { toNumber } from "@/lib/erp-calculations";
import { formatCurrency, formatUsDate } from "@/lib/format";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  getVendorBillUploadContentType,
  isAllowedVendorBillFile,
} from "@/lib/vendor-bill-files";
import {
  getVendorBillStatusLabel,
  getVendorBillStatusTone,
  isVendorBillPaid,
} from "@/lib/vendor-bill-status";
import type {
  BankAccountRow,
  ClientRow,
  JobRow,
  ProjectRow,
  PurchaseOrderRow,
  VendorBillRow,
  VendorRow,
} from "@/types/database";

type PurchasingManagementProps = {
  clients: ClientRow[];
  vendors: VendorRow[];
  jobs: JobRow[];
  projects: ProjectRow[];
  purchaseOrders: PurchaseOrderRow[];
  bills: VendorBillRow[];
  accounts: BankAccountRow[];
  jobsSetupError?: string | null;
};

type PurchaseOrderItem = {
  clientId: string;
  jobId: string;
  item: string;
  unitPrice: string;
  qty: string;
};

const VENDOR_BILL_BUCKET = "vendor-bills";

function buildVendorBillFilePath(file: File) {
  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "-") ||
    (file.type === "application/pdf" ? "vendor-bill.pdf" : "vendor-bill.jpg");

  return `${todayInputValue()}/${crypto.randomUUID()}-${safeName}`;
}

function getBillFileName(fileReference: string) {
  const rawName = fileReference.startsWith("http")
    ? new URL(fileReference).pathname.split("/").pop()
    : fileReference.split("/").pop();

  return decodeURIComponent(rawName ?? "Bill file").replace(
    /^[0-9a-f-]{36}-/i,
    "",
  );
}

async function openVendorBillFile(fileReference: string) {
  if (!fileReference) {
    return;
  }

  if (fileReference.startsWith("http")) {
    window.open(fileReference, "_blank", "noopener,noreferrer");
    return;
  }

  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.storage
    .from(VENDOR_BILL_BUCKET)
    .createSignedUrl(fileReference, 60);

  if (error || !data?.signedUrl) {
    window.alert("파일을 열 수 없습니다. Storage 권한을 확인해 주세요.");
    return;
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

function parsePurchaseOrderItems(order?: PurchaseOrderRow): PurchaseOrderItem[] {
  if (!order) {
    return [{ clientId: "", jobId: "", item: "", unitPrice: "", qty: "1" }];
  }

  if (order.spec) {
    try {
      const parsed = JSON.parse(order.spec) as {
        items?: {
          clientId?: string | null;
          jobId?: string | null;
          item?: string;
          unitPrice?: number | string;
          qty?: number | string;
        }[];
      };

      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed.items.map((item) => ({
          clientId: String(item.clientId ?? ""),
          jobId: String(item.jobId ?? ""),
          item: String(item.item ?? ""),
          unitPrice: String(item.unitPrice ?? ""),
          qty: String(item.qty ?? "1"),
        }));
      }
    } catch {
      // Old free-text specs are converted into a single editable line item.
    }
  }

  return [
    {
      clientId: "",
      jobId: "",
      item: order.spec || "Item",
      unitPrice: String(toNumber(order.amount) || ""),
      qty: "1",
    },
  ];
}

function calculateItemsTotal(items: PurchaseOrderItem[]) {
  return items.reduce(
    (sum, item) => sum + toNumber(item.unitPrice) * (toNumber(item.qty) || 0),
    0,
  );
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getJobLabel(job: JobRow) {
  const clientName = job.clients?.company_name ?? job.clients?.name ?? "Client";
  const projectName = job.projects?.name ? ` · ${job.projects.name}` : "";

  return `${job.name} · ${clientName}${projectName}`;
}

export function PurchasingManagement({
  clients,
  vendors,
  jobs,
  projects,
  purchaseOrders,
  bills,
  accounts,
  jobsSetupError,
}: PurchasingManagementProps) {
  const [poFormKey, setPoFormKey] = useState(0);
  const [orderMode, setOrderMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [billMode, setBillMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingOrder, setEditingOrder] = useState<PurchaseOrderRow | null>(
    null,
  );
  const [editingBill, setEditingBill] = useState<VendorBillRow | null>(null);
  const [payingBill, setPayingBill] = useState<VendorBillRow | null>(null);
  const [deletedOrder, setDeletedOrder] = useState<PurchaseOrderRow | null>(
    null,
  );
  const poDisplayNumbers = buildPurchaseOrderDisplayNumbers(purchaseOrders);
  const billDisplayNumbers = buildVendorBillDisplayNumbers(bills);

  function closeOrderForm() {
    setOrderMode("closed");
    setEditingOrder(null);
  }

  function closeBillForm() {
    setBillMode("closed");
    setEditingBill(null);
  }

  async function deleteOrder(order: PurchaseOrderRow) {
    const confirmed = window.confirm("이 PO를 삭제할까요?");

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("purchase_order_id", order.id);
    if (order.project_id) {
      formData.set("project_id", order.project_id);
    }
    setDeletedOrder(order);
    await deletePurchaseOrderAction(formData);

    if (editingOrder?.id === order.id) {
      closeOrderForm();
    }
  }

  async function undoDeleteOrder() {
    if (!deletedOrder) {
      return;
    }

    const formData = new FormData();
    formData.set("purchase_order_id", deletedOrder.id);
    if (deletedOrder.project_id) {
      formData.set("project_id", deletedOrder.project_id);
    }
    await restorePurchaseOrderAction(formData);
    setDeletedOrder(null);
  }

  async function deleteBill(bill: VendorBillRow) {
    const confirmed = window.confirm("이 빌을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("vendor_bill_id", bill.id);
    if (bill.project_id) {
      formData.set("project_id", bill.project_id);
    }
    await deleteVendorBillAction(formData);

    if (editingBill?.id === bill.id) {
      closeBillForm();
    }
  }

  function openBillPayment(bill: VendorBillRow) {
    setPayingBill(bill);
    setBillMode("closed");
    setEditingBill(null);
    closeOrderForm();
  }

  function closeBillPayment() {
    setPayingBill(null);
  }

  return (
    <section className="space-y-6">
      {jobsSetupError ? (
        <div className="ui-card border-[#d8c2bd] bg-[#fff8f6] p-4">
          <h2 className="text-sm font-semibold text-[#8a2f1e]">
            Supabase Jobs SQL 실행 필요
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {jobsSetupError} PO는 Job 없이 저장할 수 있지만, Job 연결과 Job
            목록을 쓰려면 SQL 적용이 먼저 필요합니다.
          </p>
        </div>
      ) : null}

      <Panel
        title="PO"
        description="인쇄소에 나가는 발주서를 Job 또는 클라이언트 기준으로 관리합니다."
        actionLabel="PO 추가"
        onAdd={() => {
          setEditingOrder(null);
          setPoFormKey((key) => key + 1);
          setOrderMode("create");
          closeBillForm();
        }}
      >
        {orderMode !== "closed" ? (
          <PurchaseOrderForm
            key={editingOrder?.id ?? `new-po-${poFormKey}`}
            mode={orderMode === "edit" ? "edit" : "create"}
            clients={clients}
            vendors={vendors}
            jobs={jobs}
            projects={projects}
            order={editingOrder ?? undefined}
            onCancel={closeOrderForm}
            onSaved={closeOrderForm}
          />
        ) : null}
        {deletedOrder ? (
          <div className="flex flex-col justify-between gap-2 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm sm:flex-row sm:items-center">
            <p className="text-[var(--muted)]">
              <span className="font-semibold text-[var(--foreground)]">
                {poDisplayNumbers.get(deletedOrder.id) ?? deletedOrder.po_number}
              </span>{" "}
              삭제됨
            </p>
            <button
              type="button"
              className="inline-flex h-7 items-center border border-[var(--border-strong)] bg-white px-2 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--coral)] hover:bg-[var(--coral-quiet)] hover:text-[var(--coral-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
              onClick={() => void undoDeleteOrder()}
            >
              Undo
            </button>
          </div>
        ) : null}

        {purchaseOrders.length === 0 ? (
          <EmptyState
            title="PO 없음"
            description="PO 추가를 눌러 첫 발주를 등록하세요."
          />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {purchaseOrders.map((order) => (
              <DocumentRow
                key={order.id}
                title={poDisplayNumbers.get(order.id) ?? order.po_number}
                meta={[
                  order.projects?.name ?? "-",
                  order.vendors?.name ?? "-",
                  formatUsDate(order.order_date),
                ].join(" · ")}
                amount={formatCurrency(toNumber(order.amount))}
                status={order.status}
                onEdit={() => {
                  setEditingOrder(order);
                  setPoFormKey((key) => key + 1);
                  setOrderMode("edit");
                  closeBillForm();
                }}
                onDelete={() => void deleteOrder(order)}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="Bill"
        description="공급사에서 받은 빌과 미지급금을 추적합니다."
        actionLabel="빌 추가"
        onAdd={() => {
          setEditingBill(null);
          setBillMode("create");
          closeBillPayment();
          closeOrderForm();
        }}
      >
        {billMode !== "closed" ? (
          <VendorBillForm
            key={editingBill?.id ?? "new-bill"}
            mode={billMode === "edit" ? "edit" : "create"}
            vendors={vendors}
            projects={projects}
            purchaseOrders={purchaseOrders}
            poDisplayNumbers={poDisplayNumbers}
            bill={editingBill ?? undefined}
            onCancel={closeBillForm}
            onSaved={closeBillForm}
          />
        ) : null}

        {payingBill ? (
          <RecordBillPaymentForm
            key={`pay-${payingBill.id}`}
            bill={payingBill}
            billNumber={billDisplayNumbers.get(payingBill.id) ?? payingBill.bill_number ?? "Bill"}
            accounts={accounts}
            onCancel={closeBillPayment}
            onSaved={closeBillPayment}
          />
        ) : null}

        {bills.length === 0 ? (
          <EmptyState
            title="빌 없음"
            description="빌 추가를 눌러 공급사 청구서를 등록하세요."
          />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {bills.map((bill) => (
              <DocumentRow
                key={bill.id}
                title={billDisplayNumbers.get(bill.id) ?? "Bill"}
                meta={[
                  bill.description ?? bill.projects?.name ?? "-",
                  bill.vendors?.name ?? "-",
                  bill.due_date ? `Due ${formatUsDate(bill.due_date)}` : "No due date",
                ].join(" · ")}
                amount={formatCurrency(toNumber(bill.amount))}
                status={getVendorBillStatusLabel(bill.status)}
                statusTone={getVendorBillStatusTone(bill.status)}
                fileUrl={bill.file_url ?? undefined}
                onRecordPayment={
                  !isVendorBillPaid(bill.status) && accounts.length > 0
                    ? () => openBillPayment(bill)
                    : undefined
                }
                onEdit={() => {
                  setEditingBill(bill);
                  setBillMode("edit");
                  closeBillPayment();
                  closeOrderForm();
                }}
                onDelete={() => void deleteBill(bill)}
              />
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}

function PurchaseOrderForm({
  mode,
  clients,
  vendors,
  jobs,
  projects,
  order,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  clients: ClientRow[];
  vendors: VendorRow[];
  jobs: JobRow[];
  projects: ProjectRow[];
  order?: PurchaseOrderRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<PurchaseOrderItem[]>(
    parsePurchaseOrderItems(order),
  );
  const itemsTotal = calculateItemsTotal(items);

  function updateItem(
    index: number,
    key: keyof PurchaseOrderItem,
    value: string,
  ) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (key === "clientId") {
          const selectedJob = jobs.find((job) => job.id === item.jobId);

          return {
            ...item,
            clientId: value,
            jobId:
              selectedJob && selectedJob.client_id !== value ? "" : item.jobId,
          };
        }

        if (key === "jobId") {
          const selectedJob = jobs.find((job) => job.id === value);

          return {
            ...item,
            jobId: value,
            clientId: selectedJob?.client_id ?? item.clientId,
          };
        }

        return { ...item, [key]: value };
      }),
    );
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      { clientId: "", jobId: "", item: "", unitPrice: "", qty: "1" },
    ]);
  }

  function removeItem(index: number) {
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updatePurchaseOrderAction(formData);
    } else {
      await createPurchaseOrderAction(formData);
    }

    onSaved();
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <FormHeader
        title={mode === "edit" ? "PO 수정" : "PO 추가"}
        onCancel={onCancel}
      />

      {order ? (
        <>
          <input type="hidden" name="purchase_order_id" value={order.id} />
        </>
      ) : null}
      <input
        type="hidden"
        name="po_items_json"
        value={JSON.stringify(
          items.map((item) => {
            const jobClientId = jobs.find(
              (job) => job.id === item.jobId,
            )?.client_id;

            return {
              clientId: jobClientId || item.clientId || null,
              jobId: item.jobId || null,
              item: item.item,
              unitPrice: toNumber(item.unitPrice),
              qty: toNumber(item.qty) || 0,
            };
          }),
        )}
      />
      <input type="hidden" name="amount" value={itemsTotal} />

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Project Group">
          <select
            className="ui-input"
            name="project_id"
            defaultValue={order?.project_id ?? ""}
          >
            <option value="">No project group</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vendor">
          <select
            className="ui-input"
            name="vendor_id"
            required
            defaultValue={order?.vendor_id ?? ""}
          >
            <option value="">Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem]">
        <Field label="PO Date">
          <input
            className="ui-input"
            name="order_date"
            type="date"
            required
            defaultValue={order?.order_date ?? todayInputValue()}
          />
        </Field>
        <Field label="Status">
          <select
            className="ui-input"
            name="status"
            defaultValue={order?.status ?? "ordered"}
          >
            <option value="ordered">ordered</option>
            <option value="producing">producing</option>
            <option value="received">received</option>
            <option value="canceled">canceled</option>
          </select>
        </Field>
      </div>
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
          <h3 className="ui-label">Items</h3>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 border border-transparent px-2 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-white hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
            onClick={addItem}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add item
          </button>
        </div>
        <div className="overflow-x-auto border border-[var(--border)] bg-white">
          <div className="min-w-[62rem]">
            <div className="grid h-8 grid-cols-[12rem_14rem_minmax(0,1fr)_7rem_4.5rem_7rem_2rem] items-center gap-2 border-b border-[var(--border)] px-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              <span>Client</span>
              <span>Job</span>
              <span>Item</span>
              <span>Unit Price</span>
              <span>Qty</span>
              <span className="text-right">Total</span>
              <span aria-hidden="true" />
            </div>
            <div className="divide-y divide-[var(--border)]">
              {items.map((item, index) => {
                const lineTotal =
                  toNumber(item.unitPrice) * (toNumber(item.qty) || 0);
                const visibleJobs = item.clientId
                  ? jobs.filter((job) => job.client_id === item.clientId)
                  : jobs;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-[12rem_14rem_minmax(0,1fr)_7rem_4.5rem_7rem_2rem] items-center gap-2 px-2 py-1.5"
                  >
                    <select
                      className="ui-input min-h-8 border-transparent px-2 text-sm hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={item.clientId}
                      aria-label={`PO item ${index + 1} client`}
                      onChange={(event) =>
                        updateItem(index, "clientId", event.target.value)
                      }
                    >
                      <option value="">No client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.company_name ?? client.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="ui-input min-h-8 border-transparent px-2 text-sm hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={item.jobId}
                      aria-label={`PO item ${index + 1} job`}
                      onChange={(event) =>
                        updateItem(index, "jobId", event.target.value)
                      }
                    >
                      <option value="">No job</option>
                      {visibleJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {getJobLabel(job)}
                        </option>
                      ))}
                    </select>
                    <input
                      className="ui-input min-h-8 border-transparent px-2 text-sm hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={item.item}
                      required
                      placeholder="Business cards, banner…"
                      aria-label={`PO item ${index + 1}`}
                      onChange={(event) =>
                        updateItem(index, "item", event.target.value)
                      }
                    />
                    <input
                      className="ui-input min-h-8 border-transparent px-2 text-sm tabular-nums hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={item.unitPrice}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      inputMode="decimal"
                      aria-label={`PO item ${index + 1} unit price`}
                      onChange={(event) =>
                        updateItem(index, "unitPrice", event.target.value)
                      }
                    />
                    <input
                      className="ui-input min-h-8 border-transparent px-2 text-sm tabular-nums hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={item.qty}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="1"
                      inputMode="decimal"
                      aria-label={`PO item ${index + 1} quantity`}
                      onChange={(event) =>
                        updateItem(index, "qty", event.target.value)
                      }
                    />
                    <p className="text-right text-sm font-semibold tabular-nums text-[var(--foreground)]">
                      {formatCurrency(lineTotal)}
                    </p>
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center border border-transparent text-[var(--muted)] transition-colors hover:border-[#d8c2bd] hover:bg-[#fff4f1] hover:text-[#8a2f1e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a2f1e] disabled:pointer-events-none disabled:opacity-35"
                      aria-label={`Remove PO item ${index + 1}`}
                      disabled={items.length === 1}
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end border-t border-[var(--border)] bg-[var(--surface)] px-2 py-2">
              <div className="flex min-w-56 items-center justify-between gap-6">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Total Amount
                </p>
                <p className="text-base font-semibold tabular-nums">
                  {formatCurrency(itemsTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Field label="Expected Date">
        <input
          className="ui-input"
          name="expected_date"
          type="date"
          defaultValue={order?.expected_date ?? ""}
        />
      </Field>
      <button className="ui-button w-full">
        {mode === "edit" ? "변경 저장" : "PO 저장"}
      </button>
    </form>
  );
}

function VendorBillForm({
  mode,
  vendors,
  projects,
  purchaseOrders,
  poDisplayNumbers,
  bill,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  vendors: VendorRow[];
  projects: ProjectRow[];
  purchaseOrders: PurchaseOrderRow[];
  poDisplayNumbers: Map<string, string>;
  bill?: VendorBillRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(
    bill?.purchase_order_id ?? "",
  );
  const [projectId, setProjectId] = useState(bill?.project_id ?? "");
  const [vendorId, setVendorId] = useState(bill?.vendor_id ?? "");
  const [amount, setAmount] = useState(bill ? String(toNumber(bill.amount)) : "");
  const [fileReference, setFileReference] = useState(bill?.file_url ?? "");
  const [fileName, setFileName] = useState(
    bill?.file_url ? getBillFileName(bill.file_url) : "",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const selectedPurchaseOrder =
    purchaseOrders.find((order) => order.id === selectedPurchaseOrderId) ?? null;
  const selectedPurchaseOrderItems = parsePurchaseOrderItems(
    selectedPurchaseOrder ?? undefined,
  );

  function selectPurchaseOrder(purchaseOrderId: string) {
    setSelectedPurchaseOrderId(purchaseOrderId);
    const purchaseOrder = purchaseOrders.find(
      (order) => order.id === purchaseOrderId,
    );

    if (!purchaseOrder) {
      return;
    }

    setProjectId(purchaseOrder.project_id ?? "");
    setVendorId(purchaseOrder.vendor_id);
    setAmount(String(toNumber(purchaseOrder.amount)));
  }

  async function uploadBillFile(file: File) {
    setUploadError("");

    const contentType = getVendorBillUploadContentType(file);

    if (!isAllowedVendorBillFile(file) || !contentType) {
      setUploadError("PDF 또는 JPG 파일만 첨부할 수 있습니다.");
      return;
    }

    setIsUploading(true);
    const path = buildVendorBillFilePath(file);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.storage
      .from(VENDOR_BILL_BUCKET)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    setIsUploading(false);

    if (error) {
      setUploadError(
        `업로드에 실패했습니다. ${error.message} — Supabase SQL Editor에서 supabase/migrations/202606100001_vendor_bill_description.sql 을 실행해 주세요.`,
      );
      return;
    }

    setFileReference(path);
    setFileName(file.name);
  }

  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updateVendorBillAction(formData);
    } else {
      await createVendorBillAction(formData);
    }

    onSaved();
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <FormHeader
        title={mode === "edit" ? "빌 수정" : "빌 추가"}
        onCancel={onCancel}
      />

      {bill ? (
        <>
          <input type="hidden" name="vendor_bill_id" value={bill.id} />
          <input type="hidden" name="received_date" value={bill.received_date} />
          <input type="hidden" name="paid_date" value={bill.paid_date ?? ""} />
        </>
      ) : null}
      <input type="hidden" name="file_url" value={fileReference} />

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Vendor">
          <select
            className="ui-input"
            name="vendor_id"
            required
            value={vendorId}
            onChange={(event) => setVendorId(event.target.value)}
          >
            <option value="">Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <input
            className="ui-input"
            name="description"
            placeholder="Mailbox service, 명함 인쇄..."
            autoComplete="off"
            defaultValue={bill?.description ?? ""}
          />
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-[9rem_9rem_minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Amount">
          <input
            className="ui-input"
            name="amount"
            type="number"
            step="0.01"
            placeholder="850.00"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
        <Field label="Status">
          <select
            className="ui-input"
            name="status"
            defaultValue={bill?.status ?? "received"}
          >
            <option value="received">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </Field>
        <Field label="Due Date">
          <input
            className="ui-input"
            name="due_date"
            type="date"
            defaultValue={bill?.due_date ?? ""}
          />
        </Field>
        <Field label="Bill Number">
          <input
            className="ui-input"
            name="bill_number"
            placeholder="비워두면 자동 생성"
            autoComplete="off"
            defaultValue={bill?.bill_number ?? ""}
          />
        </Field>
      </div>

      <details
        className="border border-[var(--border)] bg-white"
        open={Boolean(bill?.purchase_order_id || bill?.project_id)}
      >
        <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
          + PO / 프로젝트 연결 (선택) — 발주서에서 온 빌이면 여기서 연결하세요
        </summary>
        <div className="space-y-3 border-t border-[var(--border)] px-3 py-3">
          <Field label="PO">
            <select
              className="ui-input"
              name="purchase_order_id"
              value={selectedPurchaseOrderId}
              onChange={(event) => selectPurchaseOrder(event.target.value)}
            >
              <option value="">연결 안 함</option>
              {purchaseOrders.map((purchaseOrder) => (
                <option key={purchaseOrder.id} value={purchaseOrder.id}>
                  {poDisplayNumbers.get(purchaseOrder.id) ??
                    purchaseOrder.po_number}{" "}
                  · {purchaseOrder.projects?.name ?? "-"} ·{" "}
                  {formatCurrency(toNumber(purchaseOrder.amount))}
                </option>
              ))}
            </select>
          </Field>
          {selectedPurchaseOrder ? (
            <div className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
              <p className="mb-2 font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                PO items
              </p>
              <div className="space-y-1">
                {selectedPurchaseOrderItems.map((item, index) => (
                  <div
                    key={`${item.item}-${index}`}
                    className="flex justify-between gap-3 text-[var(--muted)]"
                  >
                    <span className="min-w-0 break-words">
                      {item.item || "-"}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatCurrency(
                        toNumber(item.unitPrice) * (toNumber(item.qty) || 0),
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <Field label="Project Group">
            <select
              className="ui-input"
              name="project_id"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              <option value="">No project group</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </details>
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
          <h3 className="ui-label">Bill File</h3>
          {fileReference ? (
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 border border-transparent px-2 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-white hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
              onClick={() => void openVendorBillFile(fileReference)}
            >
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              열기
            </button>
          ) : null}
        </div>
        <div className="border border-[var(--border)] bg-white px-3 py-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                PDF 또는 JPG 첨부
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                벤더에게 받은 원본 Bill 파일을 저장합니다.
              </p>
            </div>
            <label className="inline-flex h-8 cursor-pointer items-center justify-center border border-[var(--border-strong)] bg-white px-3 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--coral)] hover:bg-[var(--coral-quiet)] hover:text-[var(--coral-strong)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--coral)]">
              파일 선택
              <input
                className="sr-only"
                type="file"
                accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void uploadBillFile(file);
                  }

                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {fileReference ? (
            <div className="mt-3 flex flex-col justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs sm:flex-row sm:items-center">
              <p className="inline-flex min-w-0 items-center gap-1 text-[var(--muted)]">
                <Paperclip
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{fileName || "Bill file"}</span>
              </p>
              <button
                type="button"
                className="self-start font-semibold text-[var(--muted)] transition-colors hover:text-[var(--coral-strong)] sm:self-auto"
                onClick={() => {
                  setFileReference("");
                  setFileName("");
                  setUploadError("");
                }}
              >
                첨부 제거
              </button>
            </div>
          ) : null}
          {isUploading ? (
            <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
              업로드 중...
            </p>
          ) : null}
          {uploadError ? (
            <p className="mt-3 text-xs font-semibold text-[#8a2f1e]">
              {uploadError}
            </p>
          ) : null}
        </div>
      </section>
      <button className="ui-button ui-button-secondary w-full">
        {mode === "edit" ? "변경 저장" : "빌 저장"}
      </button>
    </form>
  );
}

function Panel({
  title,
  description,
  actionLabel,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="ui-card p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        </div>
        <button type="button" className="ui-button sm:w-auto" onClick={onAdd}>
          {actionLabel}
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function DocumentRow({
  title,
  meta,
  amount,
  status,
  statusTone = "neutral",
  fileUrl,
  onRecordPayment,
  onEdit,
  onDelete,
}: {
  title: string;
  meta: string;
  amount: string;
  status: string;
  statusTone?: "neutral" | "warning" | "success";
  fileUrl?: string;
  onRecordPayment?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusToneClass = {
    neutral: "border-[var(--border)] bg-white text-[var(--muted)]",
    warning: "border-[#e7c8a5] bg-[#fff7ed] text-[#8a4a0a]",
    success: "border-[var(--success)]/25 bg-[#E9F6EF] text-[var(--success)]",
  }[statusTone];

  return (
    <article className="grid gap-3 py-4 text-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words font-semibold">{title}</h3>
          <span
            className={`border px-2 py-0.5 text-xs font-semibold ${statusToneClass}`}
          >
            {status}
          </span>
        </div>
        <p className="mt-1 break-words text-xs text-[var(--muted)]">{meta}</p>
        {fileUrl ? (
          <button
            type="button"
            className="mt-2 inline-flex h-7 items-center gap-1 border border-[var(--border-strong)] bg-white px-2 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--coral)] hover:bg-[var(--coral-quiet)] hover:text-[var(--coral-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
            onClick={() => void openVendorBillFile(fileUrl)}
          >
            <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
            첨부 파일
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border)] pt-2 lg:border-t-0 lg:pt-0">
        <strong className="min-w-24 text-right tabular-nums">{amount}</strong>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {onRecordPayment ? (
            <ListActionButton
              icon={<Banknote className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onRecordPayment}
            >
              지급
            </ListActionButton>
          ) : null}
          <ListActionButton
            icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={onEdit}
          >
            수정
          </ListActionButton>
          <ListActionButton
            icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
            tone="danger"
            onClick={onDelete}
          >
            삭제
          </ListActionButton>
        </div>
      </div>
    </article>
  );
}

function RecordBillPaymentForm({
  bill,
  billNumber,
  accounts,
  onCancel,
  onSaved,
}: {
  bill: VendorBillRow;
  billNumber: string;
  accounts: BankAccountRow[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const amount = toNumber(bill.amount);
  const vendorName = bill.vendors?.name ?? "";

  async function submit(formData: FormData) {
    await createTransactionAction(formData);
    onSaved();
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <FormHeader title={`지급 기록 · ${billNumber}`} onCancel={onCancel} />

      <input type="hidden" name="type" value="vendor_payment" />
      <input type="hidden" name="vendor_bill_id" value={bill.id} />
      <input type="hidden" name="vendor_id" value={bill.vendor_id} />
      <input type="hidden" name="payee" value={vendorName} />
      <input
        type="hidden"
        name="description"
        value={`Bill ${billNumber} payment`}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Date">
          <input
            className="ui-input"
            name="txn_date"
            type="date"
            required
            defaultValue={todayInputValue()}
          />
        </Field>
        <Field label="Account">
          <select
            className="ui-input"
            name="bank_account_id"
            required
            defaultValue={accounts[0]?.id ?? ""}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.institution ? `${account.institution} ` : ""}
                {account.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input
            className="ui-input"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            inputMode="decimal"
            defaultValue={amount > 0 ? String(amount) : ""}
          />
        </Field>
        <Field label="Payment Method">
          <select className="ui-input" name="payment_method" defaultValue="">
            <option value="">선택 안 함</option>
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category (선택)">
          <select className="ui-input" name="category" defaultValue="">
            <option value="">선택 안 함</option>
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="text-xs text-[var(--muted)]">
        저장하면 어카운팅 장부에 벤더 지급으로 기록되고 빌이 자동으로 Paid
        처리됩니다.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={onCancel}
        >
          취소
        </button>
        <button className="ui-button">지급 저장</button>
      </div>
    </form>
  );
}

function FormHeader({
  title,
  onCancel,
}: {
  title: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <button
        type="button"
        className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
        onClick={onCancel}
      >
        닫기
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="ui-label">{label}</span>
      {children}
    </label>
  );
}
