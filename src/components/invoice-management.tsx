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
import type { InvoiceItemRow, InvoiceRow, ProjectRow } from "@/types/database";

type InvoiceWithItems = InvoiceRow & {
  invoice_items: InvoiceItemRow[];
};

type InvoiceManagementProps = {
  projects: ProjectRow[];
  invoices: InvoiceWithItems[];
};

export function InvoiceManagement({
  projects,
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
  invoice,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  projects: ProjectRow[];
  invoice?: InvoiceWithItems;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const item = invoice?.invoice_items[0];

  async function submit(formData: FormData) {
    if (mode === "edit") {
      await updateInvoiceAction(formData);
    } else {
      await createInvoiceAction(formData);
    }

    onSaved();
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
            name="invoice_item_id"
            value={item?.id ?? ""}
          />
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

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Project">
          <select
            className="ui-input"
            name="project_id"
            required
            defaultValue={invoice?.project_id ?? ""}
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
            defaultValue={invoice?.client_id ?? ""}
          >
            <option value="">Client</option>
            {projects.map((project) => (
              <option key={project.id} value={project.client_id}>
                {project.clients?.company_name ?? project.clients?.name} (
                {project.name})
              </option>
            ))}
          </select>
        </Field>
      </div>
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
      <Field label="Description">
        <input
          className="ui-input"
          name="description"
          placeholder="Design service..."
          autoComplete="off"
          defaultValue={item?.description ?? ""}
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-[8rem_1fr_10rem]">
        <Field label="Quantity">
          <input
            className="ui-input"
            name="quantity"
            type="number"
            step="0.01"
            defaultValue={item ? toNumber(item.quantity) : "1"}
            inputMode="decimal"
          />
        </Field>
        <Field label="Unit Price">
          <input
            className="ui-input"
            name="unit_price"
            type="number"
            step="0.01"
            placeholder="1200.00"
            inputMode="decimal"
            defaultValue={item ? toNumber(item.unit_price) : ""}
          />
        </Field>
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
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
          <input
            name="is_taxable"
            type="checkbox"
            className="h-4 w-4"
            defaultChecked={item?.is_taxable ?? false}
          />
          Taxable
        </label>
        <Field label="Tax Rate">
          <input
            className="ui-input"
            name="tax_rate"
            type="number"
            step="0.00001"
            placeholder="0.06625"
            inputMode="decimal"
            defaultValue={item ? toNumber(item.tax_rate) : ""}
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
