"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  createPurchaseOrderAction,
  createVendorBillAction,
  deletePurchaseOrderAction,
  deleteVendorBillAction,
  updatePurchaseOrderAction,
  updateVendorBillAction,
} from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { ListActionButton } from "@/components/list-action-button";
import { toNumber } from "@/lib/erp-calculations";
import { formatCurrency, formatUsDate } from "@/lib/format";
import type {
  ClientRow,
  ProjectRow,
  PurchaseOrderRow,
  VendorBillRow,
  VendorRow,
} from "@/types/database";

type PurchasingManagementProps = {
  vendors: VendorRow[];
  clients: ClientRow[];
  projects: ProjectRow[];
  purchaseOrders: PurchaseOrderRow[];
  bills: VendorBillRow[];
};

type PurchaseOrderItem = {
  clientId: string;
  item: string;
  unitPrice: string;
  qty: string;
};

function parsePurchaseOrderItems(order?: PurchaseOrderRow): PurchaseOrderItem[] {
  if (!order) {
    return [{ clientId: "", item: "", unitPrice: "", qty: "1" }];
  }

  if (order.spec) {
    try {
      const parsed = JSON.parse(order.spec) as {
        items?: {
          clientId?: string | null;
          item?: string;
          unitPrice?: number | string;
          qty?: number | string;
        }[];
      };

      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed.items.map((item) => ({
          clientId: String(item.clientId ?? ""),
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

export function PurchasingManagement({
  vendors,
  clients,
  projects,
  purchaseOrders,
  bills,
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
    formData.set("project_id", order.project_id);
    await deletePurchaseOrderAction(formData);

    if (editingOrder?.id === order.id) {
      closeOrderForm();
    }
  }

  async function deleteBill(bill: VendorBillRow) {
    const confirmed = window.confirm("이 빌을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("vendor_bill_id", bill.id);
    formData.set("project_id", bill.project_id);
    await deleteVendorBillAction(formData);

    if (editingBill?.id === bill.id) {
      closeBillForm();
    }
  }

  return (
    <section className="space-y-6">
      <Panel
        title="PO"
        description="인쇄소에 나가는 발주서를 프로젝트 기준으로 관리합니다."
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
            vendors={vendors}
            clients={clients}
            projects={projects}
            order={editingOrder ?? undefined}
            onCancel={closeOrderForm}
            onSaved={closeOrderForm}
          />
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
                title={order.po_number}
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
          closeOrderForm();
        }}
      >
        {billMode !== "closed" ? (
          <VendorBillForm
            key={editingBill?.id ?? "new-bill"}
            mode={billMode === "edit" ? "edit" : "create"}
            vendors={vendors}
            projects={projects}
            bill={editingBill ?? undefined}
            onCancel={closeBillForm}
            onSaved={closeBillForm}
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
                title={bill.bill_number ?? bill.id}
                meta={[
                  bill.projects?.name ?? "-",
                  bill.vendors?.name ?? "-",
                  bill.due_date ? `Due ${formatUsDate(bill.due_date)}` : "No due date",
                ].join(" · ")}
                amount={formatCurrency(toNumber(bill.amount))}
                status={bill.status}
                onEdit={() => {
                  setEditingBill(bill);
                  setBillMode("edit");
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
  vendors,
  clients,
  projects,
  order,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  vendors: VendorRow[];
  clients: ClientRow[];
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
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      { clientId: "", item: "", unitPrice: "", qty: "1" },
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
          items.map((item) => ({
            clientId: item.clientId || null,
            item: item.item,
            unitPrice: toNumber(item.unitPrice),
            qty: toNumber(item.qty) || 0,
          })),
        )}
      />
      <input type="hidden" name="amount" value={itemsTotal} />

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Project">
          <select
            className="ui-input"
            name="project_id"
            required
            defaultValue={order?.project_id ?? ""}
          >
            <option value="">Project</option>
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
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_9rem_10rem]">
        <Field label="PO Number">
          <input
            className="ui-input"
            name="po_number"
            placeholder="PO-1001..."
            autoComplete="off"
            defaultValue={order?.po_number ?? ""}
          />
        </Field>
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
          <div className="min-w-[48rem]">
            <div className="grid h-8 grid-cols-[10rem_minmax(0,1fr)_7rem_4.5rem_7rem_2rem] items-center gap-2 border-b border-[var(--border)] px-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              <span>Client</span>
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

                return (
                  <div
                    key={index}
                    className="grid grid-cols-[10rem_minmax(0,1fr)_7rem_4.5rem_7rem_2rem] items-center gap-2 px-2 py-1.5"
                  >
                    <select
                      className="ui-input min-h-8 border-transparent px-2 text-sm hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={item.clientId}
                      required
                      aria-label={`PO item ${index + 1} client`}
                      onChange={(event) =>
                        updateItem(index, "clientId", event.target.value)
                      }
                    >
                      <option value="">Client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.company_name ?? client.name}
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
  bill,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  vendors: VendorRow[];
  projects: ProjectRow[];
  bill?: VendorBillRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
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
          <input
            type="hidden"
            name="purchase_order_id"
            value={bill.purchase_order_id ?? ""}
          />
          <input type="hidden" name="received_date" value={bill.received_date} />
          <input type="hidden" name="paid_date" value={bill.paid_date ?? ""} />
          <input type="hidden" name="file_url" value={bill.file_url ?? ""} />
        </>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Project">
          <select
            className="ui-input"
            name="project_id"
            required
            defaultValue={bill?.project_id ?? ""}
          >
            <option value="">Project</option>
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
            defaultValue={bill?.vendor_id ?? ""}
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
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_9rem_9rem]">
        <Field label="Bill Number">
          <input
            className="ui-input"
            name="bill_number"
            placeholder="INV-2001..."
            autoComplete="off"
            defaultValue={bill?.bill_number ?? ""}
          />
        </Field>
        <Field label="Amount">
          <input
            className="ui-input"
            name="amount"
            type="number"
            step="0.01"
            placeholder="850.00"
            inputMode="decimal"
            defaultValue={bill ? toNumber(bill.amount) : ""}
          />
        </Field>
        <Field label="Status">
          <select
            className="ui-input"
            name="status"
            defaultValue={bill?.status ?? "received"}
          >
            <option value="received">received</option>
            <option value="paid">paid</option>
          </select>
        </Field>
      </div>
      <Field label="Due Date">
        <input
          className="ui-input"
          name="due_date"
          type="date"
          defaultValue={bill?.due_date ?? ""}
        />
      </Field>
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
  onEdit,
  onDelete,
}: {
  title: string;
  meta: string;
  amount: string;
  status: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="grid gap-3 py-4 text-sm md:grid-cols-[minmax(0,1fr)_9rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words font-semibold">{title}</h3>
          <span className="border border-[var(--border)] bg-white px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
            {status}
          </span>
        </div>
        <p className="mt-1 break-words text-xs text-[var(--muted)]">{meta}</p>
      </div>
      <div className="flex flex-col gap-2 md:items-end">
        <strong className="tabular-nums">{amount}</strong>
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
