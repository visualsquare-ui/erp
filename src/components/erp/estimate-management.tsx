"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Eye, FileSearch, Pencil, Send, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createEstimateAction,
  deleteEstimateAction,
  updateEstimateAction,
} from "@/app/(erp)/actions";
import { EmptyState } from "@/components/erp/empty-state";
import { ListActionButton } from "@/components/erp/list-action-button";
import { StatusBadge } from "@/components/erp/status-badge";
import { toNumber } from "@/lib/erp-calculations";
import {
  buildEstimateLineItems,
  formatQuantity,
  getDefaultEstimateValidUntil,
  getEstimateRecipient,
} from "@/lib/estimate-document";
import { formatCurrency, formatUsDate } from "@/lib/format";
import { getInvoiceClientOptions } from "@/lib/invoice-client-options";
import { NJ_SALES_TAX_RATE_INPUT } from "@/lib/sales-tax";
import type {
  ClientRow,
  EstimateItemRow,
  EstimateRow,
  JobRow,
} from "@/types/database";
import type { EstimateStatus } from "@/types/erp";

import logo from "../../../assets/vs-logo-transparent.png";

type EstimateWithItems = EstimateRow & {
  estimate_items: EstimateItemRow[];
};

type JobOption = Pick<JobRow, "id" | "client_id" | "name" | "status">;

type EstimateManagementProps = {
  clients: ClientRow[];
  jobs: JobOption[];
  estimates: EstimateWithItems[];
  schemaError?: string | null;
};

type EstimateFormItem = {
  description: string;
  quantity: string;
  unitPrice: string;
  isTaxable: boolean;
  taxRate: string;
};

const statusOptions: { value: EstimateStatus; label: string }[] = [
  { value: "draft", label: "초안 (draft)" },
  { value: "sent", label: "발송 (sent)" },
  { value: "accepted", label: "수락 (accepted)" },
  { value: "declined", label: "거절 (declined)" },
];

function todayLocalIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function createEmptyItem(): EstimateFormItem {
  return {
    description: "",
    quantity: "1",
    unitPrice: "",
    isTaxable: false,
    taxRate: NJ_SALES_TAX_RATE_INPUT,
  };
}

function buildItemsFromEstimate(estimate: EstimateWithItems): EstimateFormItem[] {
  const lines = buildEstimateLineItems(estimate);

  if (lines.length === 0) {
    return [createEmptyItem()];
  }

  return lines.map((line) => ({
    description: line.description,
    quantity: String(line.quantity),
    unitPrice: String(line.unitPrice),
    isTaxable: line.isTaxable,
    taxRate: String(line.taxRate || NJ_SALES_TAX_RATE_INPUT),
  }));
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function EstimateManagement({
  clients,
  jobs,
  estimates,
  schemaError,
}: EstimateManagementProps) {
  const router = useRouter();
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingEstimate, setEditingEstimate] =
    useState<EstimateWithItems | null>(null);
  const [previewEstimate, setPreviewEstimate] =
    useState<EstimateWithItems | null>(null);

  function closeForm() {
    setFormMode("closed");
    setEditingEstimate(null);
  }

  async function deleteEstimate(estimate: EstimateWithItems) {
    const confirmed = window.confirm(
      `${estimate.estimate_number} 견적서를 삭제할까요?`,
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("estimate_id", estimate.id);
    await deleteEstimateAction(formData);

    if (editingEstimate?.id === estimate.id) {
      closeForm();
    }
  }

  return (
    <section className="space-y-4">
      {schemaError ? (
        <p className="border border-[#d8c2bd] bg-[#fff4f1] px-3 py-2 text-sm text-[#8a2f1e]">
          {schemaError}
        </p>
      ) : null}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Estimate 목록</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            고객에게 보낼 견적서를 만들고 발송, 수락 여부를 관리합니다.
          </p>
        </div>
        <button
          type="button"
          className="ui-button sm:w-auto"
          disabled={Boolean(schemaError)}
          onClick={() => {
            setEditingEstimate(null);
            setFormMode("create");
          }}
        >
          Estimate 추가
        </button>
      </div>

      {formMode !== "closed" ? (
        <EstimateForm
          key={editingEstimate?.id ?? "new-estimate"}
          mode={formMode === "edit" ? "edit" : "create"}
          clients={clients}
          jobs={jobs}
          estimate={editingEstimate ?? undefined}
          onCancel={closeForm}
          onSaved={closeForm}
        />
      ) : null}

      <div className="ui-card overflow-hidden">
        {estimates.length === 0 ? (
          <EmptyState
            title="Estimate 없음"
            description="Estimate 추가를 눌러 첫 견적서를 작성하세요."
          />
        ) : (
          estimates.map((estimate) => (
            <EstimateRowCard
              key={estimate.id}
              estimate={estimate}
              onView={() => setPreviewEstimate(estimate)}
              onEdit={() => {
                setEditingEstimate(estimate);
                setFormMode("edit");
              }}
              onDelete={() => void deleteEstimate(estimate)}
            />
          ))
        )}
      </div>

      {previewEstimate ? (
        <EstimatePreviewModal
          estimate={previewEstimate}
          onClose={() => setPreviewEstimate(null)}
          onSent={() => router.refresh()}
        />
      ) : null}
    </section>
  );
}

function EstimateForm({
  mode,
  clients,
  jobs,
  estimate,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  clients: ClientRow[];
  jobs: JobOption[];
  estimate?: EstimateWithItems;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const initialIssueDate = estimate?.issue_date ?? todayLocalIso();
  const [clientId, setClientId] = useState(estimate?.client_id ?? "");
  const [jobId, setJobId] = useState(estimate?.job_id ?? "");
  const [issueDate, setIssueDate] = useState(initialIssueDate);
  const [validUntil, setValidUntil] = useState(
    estimate ? (estimate.valid_until ?? "") : getDefaultEstimateValidUntil(initialIssueDate),
  );
  const [validUntilTouched, setValidUntilTouched] = useState(Boolean(estimate));
  const [items, setItems] = useState<EstimateFormItem[]>(
    estimate ? buildItemsFromEstimate(estimate) : [createEmptyItem()],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientOptions = getInvoiceClientOptions(clients);
  const clientJobs = jobs.filter((job) => job.client_id === clientId);
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
    setIsSaving(true);
    setError(null);

    try {
      if (mode === "edit") {
        await updateEstimateAction(formData);
      } else {
        await createEstimateAction(formData);
      }

      onSaved();
    } catch (saveError) {
      setError(errorMessage(saveError, "Estimate 저장에 실패했습니다."));
    } finally {
      setIsSaving(false);
    }
  }

  function selectClient(nextClientId: string) {
    setClientId(nextClientId);

    if (!jobs.some((job) => job.id === jobId && job.client_id === nextClientId)) {
      setJobId("");
    }
  }

  function changeIssueDate(nextIssueDate: string) {
    setIssueDate(nextIssueDate);

    if (!validUntilTouched && nextIssueDate) {
      setValidUntil(getDefaultEstimateValidUntil(nextIssueDate));
    }
  }

  function updateItem(
    index: number,
    key: keyof EstimateFormItem,
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
      return nextItems.length > 0 ? nextItems : [createEmptyItem()];
    });
  }

  return (
    <form action={submit} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "Estimate 수정" : "Estimate 추가"}
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={onCancel}
        >
          닫기
        </button>
      </div>

      {estimate ? (
        <input type="hidden" name="estimate_id" value={estimate.id} />
      ) : null}
      <input
        type="hidden"
        name="estimate_items_json"
        value={JSON.stringify(
          items.map((item) => ({
            description: item.description,
            quantity: toNumber(item.quantity) || 1,
            unitPrice: toNumber(item.unitPrice),
            isTaxable: item.isTaxable,
            taxRate: toNumber(item.taxRate),
          })),
        )}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Client">
          <select
            className="ui-input"
            name="client_id"
            required
            value={clientId}
            onChange={(event) => selectClient(event.target.value)}
          >
            <option value="">Client</option>
            {clientOptions.map((client) => (
              <option key={client.id} value={client.id}>
                {client.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Job (선택)">
          <select
            className="ui-input"
            name="job_id"
            value={jobId}
            disabled={!clientId}
            onChange={(event) => setJobId(event.target.value)}
          >
            <option value="">No job</option>
            {clientJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem_10rem]">
        <Field label="Estimate #">
          <input
            className="ui-input"
            name="estimate_number"
            placeholder={`비워두면 자동 (EST-${issueDate.slice(0, 4)}-0001)`}
            autoComplete="off"
            defaultValue={estimate?.estimate_number ?? ""}
          />
        </Field>
        <Field label="Issue Date">
          <input
            className="ui-input"
            name="issue_date"
            type="date"
            required
            value={issueDate}
            onChange={(event) => changeIssueDate(event.target.value)}
          />
        </Field>
        <Field label="Valid Until">
          <input
            className="ui-input"
            name="valid_until"
            type="date"
            value={validUntil}
            onChange={(event) => {
              setValidUntilTouched(true);
              setValidUntil(event.target.value);
            }}
          />
        </Field>
        <Field label="Status">
          <select
            className="ui-input"
            name="status"
            defaultValue={estimate?.status ?? "draft"}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
          <h3 className="ui-label">Estimate Items</h3>
          <button
            type="button"
            className="inline-flex h-7 items-center border border-transparent px-2 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-white hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
            onClick={() =>
              setItems((currentItems) => [...currentItems, createEmptyItem()])
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
              <span title="체크하면 NJ Sales Tax 6.625%가 부과됩니다">Taxable</span>
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
                    key={index}
                    className="grid grid-cols-[minmax(0,1fr)_5rem_7rem_5rem_6rem_7rem_4rem] items-start gap-2 px-2 py-1.5"
                  >
                    <textarea
                      className="ui-input min-h-8 resize-y border-transparent px-2 py-1.5 text-sm hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      rows={2}
                      value={lineItem.description}
                      required
                      placeholder={'예: Mesh Banner 60" H x 180" W'}
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                    />
                    <input
                      className="ui-input min-h-8 border-transparent px-2 text-sm tabular-nums hover:border-[var(--border)] focus-visible:border-[var(--coral)]"
                      value={lineItem.quantity}
                      type="number"
                      step="0.01"
                      min="0.01"
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
                    <label className="flex min-h-8 items-center justify-center">
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
                    <p className="min-h-8 pt-1.5 text-right text-sm font-semibold tabular-nums">
                      {formatCurrency(lineTotal)}
                    </p>
                    <button
                      type="button"
                      className="min-h-8 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[#8a2f1e]"
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

      <Field label="Notes (견적서 하단에 표시)">
        <textarea
          className="ui-input min-h-20 resize-y py-2"
          name="notes"
          rows={3}
          placeholder={"예: Installation is not included.\nShipping and sales tax, if any, are not included."}
          defaultValue={estimate?.notes ?? ""}
        />
      </Field>

      {error ? (
        <p className="border border-[#d8c2bd] bg-[#fff4f1] px-3 py-2 text-sm text-[#8a2f1e]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={onCancel}
        >
          취소
        </button>
        <button className="ui-button" disabled={isSaving}>
          {isSaving ? "저장 중" : mode === "edit" ? "변경 저장" : "Estimate 저장"}
        </button>
      </div>
    </form>
  );
}

function EstimateRowCard({
  estimate,
  onView,
  onEdit,
  onDelete,
}: {
  estimate: EstimateWithItems;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="grid gap-4 border-b border-[var(--border)] p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_13rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="break-words font-semibold">{estimate.estimate_number}</h3>
          <StatusBadge status={estimate.status} />
        </div>
        <p className="mt-1 break-words text-sm text-[var(--muted)]">
          {estimate.clients?.company_name ?? estimate.clients?.name} ·{" "}
          {estimate.jobs?.name ?? "No job"}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Issue {formatUsDate(estimate.issue_date)}
          {estimate.valid_until
            ? ` · Valid until ${formatUsDate(estimate.valid_until)}`
            : ""}
          {` · ${estimate.estimate_items.length}개 항목`}
        </p>
      </div>
      <div className="flex flex-col gap-3 md:items-end">
        <div className="w-full space-y-1 text-sm tabular-nums">
          <p className="flex justify-between gap-3">
            <span className="text-[var(--muted)]">Subtotal</span>
            <strong>{formatCurrency(toNumber(estimate.subtotal))}</strong>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-[var(--muted)]">Tax</span>
            <strong>{formatCurrency(toNumber(estimate.tax))}</strong>
          </p>
          <p className="mt-2 flex justify-between gap-3 border-t border-[var(--border)] pt-2">
            <span>Total</span>
            <strong>{formatCurrency(toNumber(estimate.total))}</strong>
          </p>
        </div>
        <div className="flex justify-end gap-1 border-t border-[var(--border)] pt-2 md:w-full">
          <ListActionButton
            icon={<Eye className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={onView}
          >
            View
          </ListActionButton>
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

function EstimatePreviewModal({
  estimate,
  onClose,
  onSent,
}: {
  estimate: EstimateWithItems;
  onClose: () => void;
  onSent: () => void;
}) {
  const [isSending, setIsSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recipient = getEstimateRecipient(estimate);
  const lineItems = buildEstimateLineItems(estimate);
  const alreadySent = Boolean(estimate.sent_at) || estimate.status !== "draft";
  const canSend = Boolean(recipient.email);
  const notes = (estimate.notes ?? "").trim();

  async function sendEstimate() {
    const confirmed = window.confirm(
      `${estimate.estimate_number} 견적서를 ${recipient.email} 로 보낼까요?`,
    );

    if (!confirmed) {
      return;
    }

    setIsSending(true);
    setSentTo(null);
    setError(null);

    try {
      const response = await fetch(`/api/estimates/${estimate.id}/send`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        sentTo?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Estimate 발송에 실패했습니다.");
      }

      setSentTo(body.sentTo ?? recipient.email);
    } catch (sendError) {
      setError(errorMessage(sendError, "Estimate 발송에 실패했습니다."));
    } finally {
      setIsSending(false);
    }
  }

  function confirmSent() {
    setSentTo(null);
    onSent();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/35 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${estimate.estimate_number} preview`}
    >
      {sentTo ? (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm border border-[var(--border)] bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#E9F6EF]">
              <Send className="h-5 w-5 text-[var(--success)]" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold">견적서를 발송했습니다</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              <strong className="font-semibold text-[var(--foreground)]">
                {estimate.estimate_number}
              </strong>
              {" PDF를 아래 주소로 보냈습니다."}
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-[var(--coral-strong)]">
              {sentTo}
            </p>
            <button
              type="button"
              className="ui-button mt-5 w-full"
              onClick={confirmSent}
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md border border-[var(--border)] bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F8E8E8]">
              <X className="h-5 w-5 text-[#8a2f1e]" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold">발송에 실패했습니다</h3>
            <p className="mt-2 break-words text-sm text-[var(--muted)]">{error}</p>
            <button
              type="button"
              className="ui-button ui-button-secondary mt-5 w-full"
              onClick={() => setError(null)}
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-4xl border border-[var(--border)] bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
          <div>
            <p className="ui-label text-[var(--coral)]">Estimate Preview</p>
            <h2 className="text-lg font-semibold">{estimate.estimate_number}</h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              className="ui-button ui-button-secondary h-9 px-3"
              href={`/api/estimates/${estimate.id}/pdf`}
              target="_blank"
              rel="noreferrer"
            >
              <FileSearch className="h-4 w-4" aria-hidden="true" />
              PDF Preview
            </a>
            <button
              type="button"
              className="ui-button ui-button-secondary h-9 px-3"
              onClick={onClose}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              닫기
            </button>
            {alreadySent ? (
              <span className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap border border-[var(--success)]/30 bg-[#E9F6EF] px-3 text-sm font-semibold text-[var(--success)]">
                <Check className="h-4 w-4" aria-hidden="true" />
                Sent
              </span>
            ) : null}
            <button
              type="button"
              className="ui-button h-9 px-3"
              disabled={!canSend || isSending}
              onClick={() => void sendEstimate()}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {isSending ? "Sending" : alreadySent ? "Resend" : "Send"}
            </button>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-4 sm:p-8">
          <div className="mx-auto max-w-[46rem] border border-[var(--border)] bg-white">
            <header className="grid gap-8 border-b border-[var(--border)] p-8 sm:grid-cols-[minmax(0,1fr)_16rem]">
              <div>
                <Image
                  src={logo}
                  alt="Visual Square"
                  className="h-24 w-32 object-cover object-center"
                  priority
                />
                <p className="mt-8 ui-label text-[var(--coral)]">Prepared For</p>
                <h3 className="mt-2 text-lg font-semibold">{recipient.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                  {recipient.contact ? <p>Attn. {recipient.contact}</p> : null}
                  {recipient.email ? <p>{recipient.email}</p> : null}
                  {recipient.address ? <p>{recipient.address}</p> : null}
                </div>
              </div>
              <div className="space-y-4 sm:text-right">
                <div>
                  <p className="ui-label text-[var(--coral)]">Estimate</p>
                  <h1 className="mt-2 break-words text-base font-semibold">
                    {estimate.estimate_number}
                  </h1>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4 sm:justify-end">
                    <dt className="text-[var(--muted)]">Issue</dt>
                    <dd className="font-semibold">
                      {formatUsDate(estimate.issue_date)}
                    </dd>
                  </div>
                  {estimate.valid_until ? (
                    <div className="flex justify-between gap-4 sm:justify-end">
                      <dt className="text-[var(--muted)]">Valid until</dt>
                      <dd className="font-semibold">
                        {formatUsDate(estimate.valid_until)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4 sm:justify-end">
                    <dt className="text-[var(--muted)]">Job</dt>
                    <dd className="font-semibold">{estimate.jobs?.name ?? "-"}</dd>
                  </div>
                </dl>
              </div>
            </header>

            <div className="p-8">
              <div className="overflow-x-auto">
                <div className="min-w-[34rem] text-sm">
                  <div className="grid grid-cols-[minmax(0,1fr)_5rem_8rem_8rem] border-y border-[var(--border)] bg-[var(--surface)] text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                    <div className="px-3 py-2 font-semibold">Description</div>
                    <div className="px-3 py-2 text-right font-semibold">Qty</div>
                    <div className="px-3 py-2 text-right font-semibold">Unit</div>
                    <div className="px-3 py-2 text-right font-semibold">Amount</div>
                  </div>
                  <div className="divide-y divide-[var(--border)]">
                    {lineItems.map((item, index) => (
                      <div
                        key={`${item.description}-${index}`}
                        className="grid grid-cols-[minmax(0,1fr)_5rem_8rem_8rem] items-start"
                      >
                        <div className="whitespace-pre-line px-3 py-3">
                          {item.description}
                        </div>
                        <div className="px-3 py-3 text-right tabular-nums">
                          {formatQuantity(item.quantity)}
                        </div>
                        <div className="px-3 py-3 text-right tabular-nums">
                          {formatCurrency(item.unitPrice)}
                        </div>
                        <div className="px-3 py-3 text-right font-semibold tabular-nums">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <dl className="w-full max-w-xs space-y-2 text-sm tabular-nums">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--muted)]">Subtotal</dt>
                    <dd className="font-semibold">
                      {formatCurrency(toNumber(estimate.subtotal))}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--muted)]">Tax</dt>
                    <dd className="font-semibold">
                      {formatCurrency(toNumber(estimate.tax))}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-3 text-base">
                    <dt>Total</dt>
                    <dd className="font-semibold">
                      {formatCurrency(toNumber(estimate.total))}
                    </dd>
                  </div>
                </dl>
              </div>

              <footer className="mt-10 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
                {notes ? (
                  <div className="mb-8">
                    <p className="ui-label text-[var(--coral)]">Notes</p>
                    <p className="mt-3 whitespace-pre-line text-sm text-[var(--foreground)]">
                      {notes}
                    </p>
                  </div>
                ) : null}
                Thank you for the opportunity.
              </footer>
            </div>
            <div className="h-1.5 bg-[var(--coral)]" />
          </div>

          <div className="mx-auto mt-4 max-w-[46rem] space-y-2 text-sm">
            {!canSend ? (
              <p className="border border-[#d8c2bd] bg-[#fff4f1] px-3 py-2 text-[#8a2f1e]">
                고객 이메일이 없어 발송할 수 없습니다. 고객 정보에 이메일을 먼저
                입력해 주세요.
              </p>
            ) : alreadySent ? (
              <p className="border border-[#c8e2d2] bg-[#f2faf5] px-3 py-2 text-[#256340]">
                이미 발송된 견적서입니다. &quot;Resend&quot;를 누르면 같은 주소로
                다시 보냅니다.
              </p>
            ) : (
              <p className="border border-[var(--border)] bg-white px-3 py-2 text-[var(--muted)]">
                &quot;Send&quot;를 누르면 {recipient.email} 로 PDF가 첨부된
                견적서 메일이 바로 발송됩니다.
              </p>
            )}
          </div>
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
