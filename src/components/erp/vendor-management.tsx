"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  createVendorAction,
  deleteVendorAction,
  updateVendorAction,
} from "@/app/(erp)/actions";
import { EmptyState } from "@/components/erp/empty-state";
import { ListActionButton } from "@/components/erp/list-action-button";
import { toNumber } from "@/lib/erp-calculations";
import { formatCurrency } from "@/lib/format";
import type {
  PurchaseOrderRow,
  VendorBillRow,
  VendorRow,
} from "@/types/database";

type VendorWithRelations = VendorRow & {
  purchase_orders: PurchaseOrderRow[];
  vendor_bills: VendorBillRow[];
};

function formatPhone(value: string | null) {
  const digits = (value ?? "").replace(/\D/g, "").slice(0, 10);

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return value || "-";
}

export function VendorManagement({
  vendors,
}: {
  vendors: VendorWithRelations[];
}) {
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingVendor, setEditingVendor] = useState<VendorWithRelations | null>(
    null,
  );

  function closeForm() {
    setFormMode("closed");
    setEditingVendor(null);
  }

  async function deleteVendor(vendor: VendorWithRelations) {
    const confirmed = window.confirm(
      "이 벤더를 삭제할까요? 연결된 PO나 빌이 있으면 삭제되지 않을 수 있습니다.",
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("vendor_id", vendor.id);
    await deleteVendorAction(formData);

    if (editingVendor?.id === vendor.id) {
      closeForm();
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">벤더 목록</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            인쇄소와 외주 거래처를 먼저 확인하고 필요할 때 추가하거나 수정합니다.
          </p>
        </div>
        <button
          type="button"
          className="ui-button sm:w-auto"
          onClick={() => {
            setEditingVendor(null);
            setFormMode("create");
          }}
        >
          벤더 추가
        </button>
      </div>

      {formMode !== "closed" ? (
        <VendorForm
          key={editingVendor?.id ?? "new-vendor"}
          mode={formMode === "edit" ? "edit" : "create"}
          vendor={editingVendor ?? undefined}
          onCancel={closeForm}
          onSaved={closeForm}
        />
      ) : null}

      <div className="ui-card overflow-hidden">
        {vendors.length === 0 ? (
          <EmptyState
            title="벤더 없음"
            description="벤더 추가를 눌러 첫 인쇄소를 등록하세요."
          />
        ) : (
          vendors.map((vendor) => {
            const billTotal = vendor.vendor_bills.reduce(
              (sum, bill) => sum + toNumber(bill.amount),
              0,
            );
            const unpaidTotal = vendor.vendor_bills.reduce(
              (sum, bill) =>
                bill.status === "paid" ? sum : sum + toNumber(bill.amount),
              0,
            );

            return (
              <article
                key={vendor.id}
                className="grid gap-4 border-b border-[var(--border)] p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_10rem]"
              >
                <div className="min-w-0">
                  <h3 className="break-words font-semibold">{vendor.name}</h3>
                  <div className="mt-2 space-y-0.5">
                    <DetailLine label="Contact" value={vendor.contact_person} />
                    <DetailLine label="Email" value={vendor.email} />
                    <DetailLine label="Phone" value={formatPhone(vendor.phone)} />
                    <DetailLine label="Specialty" value={vendor.specialty} />
                  </div>
                  {vendor.memo ? (
                    <p className="mt-2 break-words text-sm text-[var(--muted)]">
                      {vendor.memo}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-4 md:items-end md:justify-between">
                  <div className="grid w-full grid-cols-3 gap-2 text-sm md:w-auto md:min-w-28 md:grid-cols-1 md:gap-3">
                    <Metric label="PO" value={vendor.purchase_orders.length} />
                    <Metric label="Bills" value={formatCurrency(billTotal)} />
                    <Metric label="AP" value={formatCurrency(unpaidTotal)} />
                  </div>
                  <div className="flex justify-end gap-1 border-t border-[var(--border)] pt-2 md:w-full">
                    <ListActionButton
                      icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => {
                        setEditingVendor(vendor);
                        setFormMode("edit");
                      }}
                    >
                      수정
                    </ListActionButton>
                    <ListActionButton
                      icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      tone="danger"
                      onClick={() => void deleteVendor(vendor)}
                    >
                      삭제
                    </ListActionButton>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function VendorForm({
  mode,
  vendor,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  vendor?: VendorRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updateVendorAction(formData);
    } else {
      await createVendorAction(formData);
    }

    onSaved();
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "벤더 수정" : "벤더 추가"}
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={onCancel}
        >
          닫기
        </button>
      </div>

      {vendor ? <input type="hidden" name="vendor_id" value={vendor.id} /> : null}
      <Field label="Vendor">
        <input
          className="ui-input"
          name="name"
          placeholder="Print partner..."
          autoComplete="organization"
          required
          defaultValue={vendor?.name ?? ""}
        />
      </Field>
      <Field label="Contact">
        <input
          className="ui-input"
          name="contact_person"
          placeholder="Sam Lee..."
          autoComplete="name"
          defaultValue={vendor?.contact_person ?? ""}
        />
      </Field>
      <Field label="Email">
        <input
          className="ui-input"
          name="email"
          type="email"
          placeholder="vendor@example.com..."
          autoComplete="email"
          defaultValue={vendor?.email ?? ""}
        />
      </Field>
      <Field label="Phone">
        <input
          className="ui-input"
          name="phone"
          type="tel"
          placeholder="(201) 555-0123"
          autoComplete="tel"
          defaultValue={vendor?.phone ?? ""}
        />
      </Field>
      <Field label="Specialty">
        <input
          className="ui-input"
          name="specialty"
          placeholder="Large format, offset..."
          autoComplete="off"
          defaultValue={vendor?.specialty ?? ""}
        />
      </Field>
      <Field label="Memo">
        <textarea
          className="ui-input min-h-20"
          name="memo"
          placeholder="Internal note..."
          autoComplete="off"
          defaultValue={vendor?.memo ?? ""}
        />
      </Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={onCancel}
        >
          취소
        </button>
        <button className="ui-button">
          {mode === "edit" ? "저장" : "추가"}
        </button>
      </div>
    </form>
  );
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <p className="break-words text-sm leading-6 text-[var(--muted)]">
      <span className="font-semibold text-[var(--foreground)]">{label}:</span>{" "}
      {value || "-"}
    </p>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
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
