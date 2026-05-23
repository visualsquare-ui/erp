"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  createPurchaseOrderAction,
  createVendorAction,
  createVendorBillAction,
  deletePurchaseOrderAction,
  deleteVendorBillAction,
  updatePurchaseOrderAction,
  updateVendorBillAction,
} from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { toNumber } from "@/lib/erp-calculations";
import { formatCurrency, formatUsDate } from "@/lib/format";
import type {
  ProjectRow,
  PurchaseOrderRow,
  VendorBillRow,
  VendorRow,
} from "@/types/database";

type PurchasingManagementProps = {
  vendors: VendorRow[];
  projects: ProjectRow[];
  purchaseOrders: PurchaseOrderRow[];
  bills: VendorBillRow[];
};

type ActionButtonProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone?: "neutral" | "danger";
  onClick: () => void;
};

function ActionButton({
  children,
  icon,
  tone = "neutral",
  onClick,
}: ActionButtonProps) {
  const toneClass =
    tone === "danger"
      ? "text-[#8a2f1e] hover:border-[#d8c2bd] hover:bg-[#fff4f1] hover:text-[#6f2417] focus-visible:outline-[#8a2f1e]"
      : "text-[var(--muted)] hover:border-[var(--border-strong)] hover:bg-white hover:text-[var(--foreground)] focus-visible:outline-[var(--coral)]";

  return (
    <button
      type="button"
      className={`inline-flex h-7 items-center gap-1 border border-transparent px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${toneClass}`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}

export function PurchasingManagement({
  vendors,
  projects,
  purchaseOrders,
  bills,
}: PurchasingManagementProps) {
  const [editingOrder, setEditingOrder] = useState<PurchaseOrderRow | null>(
    null,
  );
  const [editingBill, setEditingBill] = useState<VendorBillRow | null>(null);

  async function deleteOrder(order: PurchaseOrderRow) {
    const confirmed = window.confirm("이 발주를 삭제할까요?");

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("purchase_order_id", order.id);
    formData.set("project_id", order.project_id);
    await deletePurchaseOrderAction(formData);

    if (editingOrder?.id === order.id) {
      setEditingOrder(null);
    }
  }

  async function deleteBill(bill: VendorBillRow) {
    const confirmed = window.confirm("이 받은 빌을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("vendor_bill_id", bill.id);
    formData.set("project_id", bill.project_id);
    await deleteVendorBillAction(formData);

    if (editingBill?.id === bill.id) {
      setEditingBill(null);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="space-y-4">
        <form action={createVendorAction} className="ui-panel space-y-4">
          <h2 className="text-sm font-semibold">인쇄소 추가</h2>
          <Field label="Vendor">
            <input
              className="ui-input"
              name="name"
              placeholder="Print partner..."
              autoComplete="organization"
              required
            />
          </Field>
          <Field label="Contact">
            <input
              className="ui-input"
              name="contact_person"
              placeholder="Sam Lee..."
              autoComplete="name"
            />
          </Field>
          <Field label="Specialty">
            <input
              className="ui-input"
              name="specialty"
              placeholder="Large format, offset..."
              autoComplete="off"
            />
          </Field>
          <button className="ui-button w-full">저장</button>
        </form>

        <PurchaseOrderForm
          mode="create"
          vendors={vendors}
          projects={projects}
        />

        <VendorBillForm mode="create" vendors={vendors} projects={projects} />
      </div>

      <div className="grid gap-6">
        <Panel title="발주">
          {editingOrder ? (
            <PurchaseOrderForm
              mode="edit"
              vendors={vendors}
              projects={projects}
              order={editingOrder}
              onCancel={() => setEditingOrder(null)}
              onSaved={() => setEditingOrder(null)}
            />
          ) : null}
          {purchaseOrders.length === 0 ? (
            <EmptyState
              title="발주 없음"
              description="프로젝트와 인쇄소를 선택해 첫 PO를 추가하세요."
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {purchaseOrders.map((order) => (
                <PurchasingRow
                  key={order.id}
                  title={order.po_number}
                  meta={`${order.projects?.name ?? "-"} · ${
                    order.vendors?.name ?? "-"
                  }`}
                  amount={formatCurrency(toNumber(order.amount))}
                  onEdit={() => {
                    setEditingOrder(order);
                    setEditingBill(null);
                  }}
                  onDelete={() => void deleteOrder(order)}
                />
              ))}
            </div>
          )}
        </Panel>
        <Panel title="받은 빌">
          {editingBill ? (
            <VendorBillForm
              mode="edit"
              vendors={vendors}
              projects={projects}
              bill={editingBill}
              onCancel={() => setEditingBill(null)}
              onSaved={() => setEditingBill(null)}
            />
          ) : null}
          {bills.length === 0 ? (
            <EmptyState
              title="받은 빌 없음"
              description="공급사 빌을 추가하면 미지급금 추적에 반영됩니다."
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {bills.map((bill) => (
                <PurchasingRow
                  key={bill.id}
                  title={bill.bill_number ?? bill.id}
                  meta={`${bill.projects?.name ?? "-"} · ${
                    bill.vendors?.name ?? "-"
                  } · ${bill.due_date ? formatUsDate(bill.due_date) : "-"}`}
                  amount={formatCurrency(toNumber(bill.amount))}
                  onEdit={() => {
                    setEditingBill(bill);
                    setEditingOrder(null);
                  }}
                  onDelete={() => void deleteBill(bill)}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
}

function PurchaseOrderForm({
  mode,
  vendors,
  projects,
  order,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  vendors: VendorRow[];
  projects: ProjectRow[];
  order?: PurchaseOrderRow;
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updatePurchaseOrderAction(formData);
      onSaved?.();
      return;
    }

    await createPurchaseOrderAction(formData);
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "발주 수정" : "발주 추가"}
        </h2>
        {mode === "edit" && onCancel ? (
          <button
            type="button"
            className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={onCancel}
          >
            닫기
          </button>
        ) : null}
      </div>

      {order ? (
        <>
          <input type="hidden" name="purchase_order_id" value={order.id} />
          <input type="hidden" name="order_date" value={order.order_date} />
          <input
            type="hidden"
            name="expected_date"
            value={order.expected_date ?? ""}
          />
          <input type="hidden" name="spec" value={order.spec ?? ""} />
          <input type="hidden" name="status" value={order.status} />
        </>
      ) : null}

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
      <Field label="PO Number">
        <input
          className="ui-input"
          name="po_number"
          placeholder="PO-1001..."
          autoComplete="off"
          defaultValue={order?.po_number ?? ""}
        />
      </Field>
      <Field label="Amount">
        <input
          className="ui-input"
          name="amount"
          type="number"
          step="0.01"
          placeholder="850.00..."
          inputMode="decimal"
          defaultValue={order ? toNumber(order.amount) : ""}
        />
      </Field>
      <button
        className={`ui-button w-full ${
          mode === "edit" ? "ui-button-secondary" : ""
        }`}
      >
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
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updateVendorBillAction(formData);
      onSaved?.();
      return;
    }

    await createVendorBillAction(formData);
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "받은 빌 수정" : "받은 빌 추가"}
        </h2>
        {mode === "edit" && onCancel ? (
          <button
            type="button"
            className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={onCancel}
          >
            닫기
          </button>
        ) : null}
      </div>

      {bill ? (
        <>
          <input type="hidden" name="vendor_bill_id" value={bill.id} />
          <input
            type="hidden"
            name="purchase_order_id"
            value={bill.purchase_order_id ?? ""}
          />
          <input
            type="hidden"
            name="received_date"
            value={bill.received_date}
          />
          <input type="hidden" name="due_date" value={bill.due_date ?? ""} />
          <input type="hidden" name="status" value={bill.status} />
          <input
            type="hidden"
            name="paid_date"
            value={bill.paid_date ?? ""}
          />
          <input type="hidden" name="file_url" value={bill.file_url ?? ""} />
        </>
      ) : null}

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
          placeholder="850.00..."
          inputMode="decimal"
          defaultValue={bill ? toNumber(bill.amount) : ""}
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ui-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function PurchasingRow({
  title,
  meta,
  amount,
  onEdit,
  onDelete,
}: {
  title: string;
  meta: string;
  amount: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-3 py-3 text-sm md:grid-cols-[minmax(0,1fr)_8rem]">
      <div className="min-w-0">
        <p className="break-words font-semibold">{title}</p>
        <p className="mt-1 break-words text-xs text-[var(--muted)]">{meta}</p>
      </div>
      <div className="flex flex-col gap-2 md:items-end">
        <strong className="tabular-nums">{amount}</strong>
        <div className="flex justify-end gap-1 border-t border-[var(--border)] pt-2 md:w-full">
          <ActionButton
            icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={onEdit}
          >
            수정
          </ActionButton>
          <ActionButton
            icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
            tone="danger"
            onClick={onDelete}
          >
            삭제
          </ActionButton>
        </div>
      </div>
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
