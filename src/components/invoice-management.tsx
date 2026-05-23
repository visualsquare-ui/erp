"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  createInvoiceAction,
  deleteInvoiceAction,
  updateInvoiceAction,
} from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { ListActionButton } from "@/components/list-action-button";
import { StatusBadge } from "@/components/status-badge";
import { toNumber } from "@/lib/erp-calculations";
import { formatCurrency, formatUsDate } from "@/lib/format";
import {
  buildInvoiceItemsFromPurchaseOrder,
  type InvoiceLineDraft,
} from "@/lib/invoice-po-items";
import type {
  InvoiceItemRow,
  InvoiceRow,
  ProjectRow,
  PurchaseOrderRow,
} from "@/types/database";

type InvoiceWithItems = InvoiceRow & {
  invoice_items: InvoiceItemRow[];
};

type InvoiceManagementProps = {
  projects: ProjectRow[];
  purchaseOrders: PurchaseOrderRow[];
  invoices: InvoiceWithItems[];
};

type InvoiceFormItem = {
  purchaseOrderId: string;
  jobId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  isTaxable: boolean;
  taxRate: string;
};

function createManualInvoiceItem(): InvoiceFormItem {
  return {
    purchaseOrderId: "",
    jobId: "",
    description: "",
    quantity: "1",
    unitPrice: "",
    isTaxable: false,
    taxRate: "0.06625",
  };
}

function invoiceDraftToFormItem(item: InvoiceLineDraft): InvoiceFormItem {
  return {
    purchaseOrderId: item.purchaseOrderId ?? "",
    jobId: item.jobId ?? "",
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    isTaxable: false,
    taxRate: "0.06625",
  };
}

function buildItemsFromInvoice(invoice: InvoiceWithItems): InvoiceFormItem[] {
  if (invoice.invoice_items.length === 0) {
    return [createManualInvoiceItem()];
  }

  return invoice.invoice_items.map((item) => ({
    purchaseOrderId: item.purchase_order_id ?? "",
    jobId: item.job_id ?? "",
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: String(item.unit_price),
    isTaxable: item.is_taxable,
    taxRate: String(item.tax_rate),
  }));
}

function getClientOptions(projects: ProjectRow[]) {
  const options = new Map<string, string>();

  projects.forEach((project) => {
    if (!options.has(project.client_id)) {
      options.set(
        project.client_id,
        project.clients?.company_name ?? project.clients?.name ?? "Client",
      );
    }
  });

  return Array.from(options, ([id, label]) => ({ id, label }));
}

export function InvoiceManagement({
  projects,
  purchaseOrders,
  invoices,
}: InvoiceManagementProps) {
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingInvoice, setEditingInvoice] =
    useState<InvoiceWithItems | null>(null);

  function closeForm() {
    setFormMode("closed");
    setEditingInvoice(null);
  }

  async function deleteInvoice(invoice: InvoiceWithItems) {
    const confirmed = window.confirm("이 인보이스를 삭제할까요?");

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("invoice_id", invoice.id);
    formData.set("project_id", invoice.project_id);
    await deleteInvoiceAction(formData);

    if (editingInvoice?.id === invoice.id) {
      closeForm();
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Invoice 목록</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            고객 청구서를 먼저 확인하고 필요할 때 생성하거나 수정합니다.
          </p>
        </div>
        <button
          type="button"
          className="ui-button sm:w-auto"
          onClick={() => {
            setEditingInvoice(null);
            setFormMode("create");
          }}
        >
          Invoice 추가
        </button>
      </div>

      {formMode !== "closed" ? (
        <InvoiceForm
          key={editingInvoice?.id ?? "new-invoice"}
          mode={formMode === "edit" ? "edit" : "create"}
          projects={projects}
          purchaseOrders={purchaseOrders}
          invoice={editingInvoice ?? undefined}
          onCancel={closeForm}
          onSaved={closeForm}
        />
      ) : null}

      <div className="ui-card overflow-hidden">
        {invoices.length === 0 ? (
          <EmptyState
            title="Invoice 없음"
            description="Invoice 추가를 눌러 첫 청구서를 생성하세요."
          />
        ) : (
          invoices.map((invoice) => (
            <InvoiceRowCard
              key={invoice.id}
              invoice={invoice}
              onEdit={() => {
                setEditingInvoice(invoice);
                setFormMode("edit");
              }}
              onDelete={() => void deleteInvoice(invoice)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function InvoiceForm({
  mode,
  projects,
  purchaseOrders,
  invoice,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  projects: ProjectRow[];
  purchaseOrders: PurchaseOrderRow[];
  invoice?: InvoiceWithItems;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [projectId, setProjectId] = useState(invoice?.project_id ?? "");
  const [clientId, setClientId] = useState(invoice?.client_id ?? "");
  const [items, setItems] = useState<InvoiceFormItem[]>(
    invoice ? buildItemsFromInvoice(invoice) : [createManualInvoiceItem()],
  );
  const selectedPurchaseOrderIds = new Set(
    items
      .map((item) => item.purchaseOrderId)
      .filter((purchaseOrderId) => purchaseOrderId),
  );
  const availablePurchaseOrders = purchaseOrders.filter(
    (purchaseOrder) => !projectId || purchaseOrder.project_id === projectId,
  );
  const clients = getClientOptions(projects);
  const subtotal = items.reduce(
    (sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice),
    0,
  );
  const tax = items.reduce((sum, item) => {
    if (!item.isTaxable) {
      return sum;
    }

    return (
      sum + toNumber(item.quantity) * toNumber(item.unitPrice) * toNumber(item.taxRate)
    );
  }, 0);

  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updateInvoiceAction(formData);
    } else {
      await createInvoiceAction(formData);
    }

    onSaved();
  }

  function selectProject(nextProjectId: string) {
    const project = projects.find((candidate) => candidate.id === nextProjectId);

    setProjectId(nextProjectId);
    setClientId(project?.client_id ?? "");
    setItems((currentItems) =>
      currentItems
        .filter((item) => !item.purchaseOrderId)
        .map((item) => ({ ...item, purchaseOrderId: "" })),
    );
  }

  function togglePurchaseOrder(purchaseOrder: PurchaseOrderRow, checked: boolean) {
    if (checked) {
      if (!projectId && purchaseOrder.project_id) {
        selectProject(purchaseOrder.project_id);
      }

      const importedItems = buildInvoiceItemsFromPurchaseOrder(
        purchaseOrder,
      ).map(invoiceDraftToFormItem);

      setItems((currentItems) => [
        ...currentItems.filter(
          (item) => item.description || item.purchaseOrderId,
        ),
        ...importedItems,
      ]);
      return;
    }

    setItems((currentItems) => {
      const nextItems = currentItems.filter(
        (item) => item.purchaseOrderId !== purchaseOrder.id,
      );

      return nextItems.length > 0 ? nextItems : [createManualInvoiceItem()];
    });
  }

  function updateItem(
    index: number,
    key: keyof InvoiceFormItem,
    value: string | boolean,
  ) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function removeItem(index: number) {
    setItems((currentItems) => {
      const nextItems = currentItems.filter((_, itemIndex) => itemIndex !== index);

      return nextItems.length > 0 ? nextItems : [createManualInvoiceItem()];
    });
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "Invoice 수정" : "Invoice 추가"}
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={onCancel}
        >
          닫기
        </button>
      </div>

      {invoice ? (
        <>
          <input type="hidden" name="invoice_id" value={invoice.id} />
          <input
            type="hidden"
            name="paid_amount"
            value={toNumber(invoice.paid_amount)}
          />
          <input
            type="hidden"
            name="paid_date"
            value={invoice.paid_date ?? ""}
          />
        </>
      ) : null}
      <input
        type="hidden"
        name="invoice_items_json"
        value={JSON.stringify(
          items.map((item) => ({
            purchaseOrderId: item.purchaseOrderId || null,
            jobId: item.jobId || null,
            description: item.description,
            quantity: toNumber(item.quantity) || 1,
            unitPrice: toNumber(item.unitPrice),
            isTaxable: item.isTaxable,
            taxRate: toNumber(item.taxRate),
          })),
        )}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Project">
          <select
            className="ui-input"
            name="project_id"
            required
            value={projectId}
            onChange={(event) => selectProject(event.target.value)}
          >
            <option value="">Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Bill To">
          <select
            className="ui-input"
            name="client_id"
            required
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          >
            <option value="">Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
          <h3 className="ui-label">PO 불러오기</h3>
          <span className="text-xs text-[var(--muted)]">
            여러 PO 선택 가능
          </span>
        </div>
        {availablePurchaseOrders.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] bg-white px-3 py-4 text-sm text-[var(--muted)]">
            선택한 프로젝트에 연결된 PO가 없습니다.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {availablePurchaseOrders.map((purchaseOrder) => (
              <label
                key={purchaseOrder.id}
                className="flex cursor-pointer items-start gap-2 border border-[var(--border)] bg-white p-3 text-sm transition-colors hover:border-[var(--coral)] hover:bg-[var(--coral-quiet)]"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={selectedPurchaseOrderIds.has(purchaseOrder.id)}
                  onChange={(event) =>
                    togglePurchaseOrder(purchaseOrder, event.target.checked)
                  }
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-[var(--foreground)]">
                    {purchaseOrder.po_number}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {purchaseOrder.projects?.name ?? "-"} ·{" "}
                    {purchaseOrder.vendors?.name ?? "-"} ·{" "}
                    {formatCurrency(toNumber(purchaseOrder.amount))}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_9rem]">
        <Field label="Invoice #">
          <input
            className="ui-input"
            name="invoice_number"
            placeholder="VS-2026-0001"
            autoComplete="off"
            defaultValue={invoice?.invoice_number ?? ""}
          />
        </Field>
        <Field label="Issue Date">
          <input
            className="ui-input"
            name="issue_date"
            type="date"
            defaultValue={invoice?.issue_date ?? ""}
          />
        </Field>
        <Field label="Status">
          <select
            className="ui-input"
            name="status"
            defaultValue={invoice?.status ?? "draft"}
          >
            <option value="draft">draft</option>
            <option value="sent">sent</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
          </select>
        </Field>
      </div>
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
          <h3 className="ui-label">Invoice Items</h3>
          <button
            type="button"
            className="inline-flex h-7 items-center border border-transparent px-2 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-white hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
            onClick={() =>
              setItems((currentItems) => [...currentItems, createManualInvoiceItem()])
            }
          >
            + Line
          </button>
        </div>
        <div className="overflow-x-auto border border-[var(--border)] bg-white">
          <div className="min-w-[58rem]">
            <div className="grid h-8 grid-cols-[minmax(0,1fr)_5rem_7rem_5rem_6rem_7rem_4rem] items-center gap-2 border-b border-[var(--border)] px-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit</span>
              <span>Tax</span>
              <span>Tax Rate</span>
              <span className="text-right">Total</span>
              <span />
            </div>
            <div className="divide-y divide-[var(--border)]">
              {items.map((lineItem, index) => {
                const lineTotal =
                  toNumber(lineItem.quantity) * toNumber(lineItem.unitPrice);

                return (
                  <div
                    key={`${lineItem.purchaseOrderId}-${index}`}
                    className="grid grid-cols-[minmax(0,1fr)_5rem_7rem_5rem_6rem_7rem_4rem] items-center gap-2 px-2 py-1.5"
                  >
                    <input
                      className="ui-input min-h-8 border-transparent px-2 text-sm hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={lineItem.description}
                      required
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                    />
                    <input
                      className="ui-input min-h-8 border-transparent px-2 text-sm tabular-nums hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={lineItem.quantity}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      inputMode="decimal"
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                    />
                    <input
                      className="ui-input min-h-8 border-transparent px-2 text-sm tabular-nums hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={lineItem.unitPrice}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      inputMode="decimal"
                      onChange={(event) =>
                        updateItem(index, "unitPrice", event.target.value)
                      }
                    />
                    <label className="flex items-center justify-center">
                      <input
                        className="h-4 w-4"
                        type="checkbox"
                        checked={lineItem.isTaxable}
                        onChange={(event) =>
                          updateItem(index, "isTaxable", event.target.checked)
                        }
                      />
                    </label>
                    <input
                      className="ui-input min-h-8 border-transparent px-2 text-sm tabular-nums hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={lineItem.taxRate}
                      type="number"
                      step="0.00001"
                      min="0"
                      inputMode="decimal"
                      onChange={(event) =>
                        updateItem(index, "taxRate", event.target.value)
                      }
                    />
                    <p className="text-right text-sm font-semibold tabular-nums">
                      {formatCurrency(lineTotal)}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[#8a2f1e]"
                      onClick={() => removeItem(index)}
                    >
                      삭제
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end border-t border-[var(--border)] bg-[var(--surface)] px-2 py-2">
              <div className="w-64 space-y-1 text-sm tabular-nums">
                <p className="flex justify-between gap-3">
                  <span className="text-[var(--muted)]">Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-[var(--muted)]">Tax</span>
                  <strong>{formatCurrency(tax)}</strong>
                </p>
                <p className="flex justify-between gap-3 border-t border-[var(--border)] pt-1">
                  <span>Total</span>
                  <strong>{formatCurrency(subtotal + tax)}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <Field label="Terms">
          <select
            className="ui-input"
            name="terms"
            defaultValue={invoice?.terms ?? "net_30"}
          >
            <option value="net_30">Net 30</option>
            <option value="net_15">Net 15</option>
            <option value="due_on_receipt">Due on receipt</option>
          </select>
        </Field>
        <Field label="Due Date">
          <input
            className="ui-input"
            name="due_date"
            type="date"
            defaultValue={invoice?.due_date ?? ""}
          />
        </Field>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={onCancel}
        >
          취소
        </button>
        <button className="ui-button">
          {mode === "edit" ? "변경 저장" : "Invoice 저장"}
        </button>
      </div>
    </form>
  );
}

function InvoiceRowCard({
  invoice,
  onEdit,
  onDelete,
}: {
  invoice: InvoiceWithItems;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="grid gap-4 border-b border-[var(--border)] p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_13rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="break-words font-semibold">{invoice.invoice_number}</h3>
          <StatusBadge status={invoice.status} />
        </div>
        <p className="mt-1 break-words text-sm text-[var(--muted)]">
          {invoice.clients?.company_name ?? invoice.clients?.name} ·{" "}
          {invoice.projects?.name}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Issue {formatUsDate(invoice.issue_date)} · Due{" "}
          {formatUsDate(invoice.due_date)}
        </p>
      </div>
      <div className="flex flex-col gap-3 md:items-end">
        <div className="w-full space-y-1 text-sm tabular-nums">
          <p className="flex justify-between gap-3">
            <span className="text-[var(--muted)]">Subtotal</span>
            <strong>{formatCurrency(toNumber(invoice.subtotal))}</strong>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-[var(--muted)]">Tax</span>
            <strong>{formatCurrency(toNumber(invoice.tax))}</strong>
          </p>
          <p className="mt-2 flex justify-between gap-3 border-t border-[var(--border)] pt-2">
            <span>Total</span>
            <strong>{formatCurrency(toNumber(invoice.total))}</strong>
          </p>
        </div>
        <div className="flex justify-end gap-1 border-t border-[var(--border)] pt-2 md:w-full">
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
