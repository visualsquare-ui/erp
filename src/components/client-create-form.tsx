"use client";

import { useEffect, useMemo, useState } from "react";

import { createClientAction, updateClientAction } from "@/app/actions";
import { calculateOutstandingAr, toNumber } from "@/lib/erp-calculations";
import { formatCurrency } from "@/lib/format";
import type { ClientRow, InvoiceRow, ProjectRow } from "@/types/database";

type AddressSuggestion = {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

type AddressSuggestionsResponse = {
  suggestions: AddressSuggestion[];
};

type ClientWithRelations = ClientRow & {
  projects: ProjectRow[];
  invoices: InvoiceRow[];
};

type AddressParts = {
  street: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
};

type ClientFormValues = {
  id?: string;
  companyName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  memo?: string | null;
};

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="ui-label">{label}</span>
      {children}
    </label>
  );
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function buildAddress({
  street,
  street1,
  city,
  state,
  zip,
}: AddressParts) {
  const line1 = street.trim();
  const line2 = street1.trim();
  const cityStateZip = [city.trim(), state.trim(), zip.trim()]
    .filter(Boolean)
    .join(" ");

  return [line1, line2, cityStateZip].filter(Boolean).join(", ");
}

function parseStateZip(value: string) {
  const match = value.trim().match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);

  if (!match) {
    return null;
  }

  return {
    state: match[1].toUpperCase(),
    zip: match[2],
  };
}

function parseCityStateZip(value: string) {
  const match = value
    .trim()
    .match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);

  if (!match) {
    return null;
  }

  return {
    city: match[1],
    state: match[2].toUpperCase(),
    zip: match[3],
  };
}

function parseAddress(address?: string | null): AddressParts {
  if (!address) {
    return { street: "", street1: "", city: "", state: "", zip: "" };
  }

  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const [street = ""] = parts;

  if (parts.length >= 3) {
    const stateZip = parseStateZip(parts[parts.length - 1]);

    if (stateZip) {
      return {
        street,
        street1: parts.length > 3 ? parts.slice(1, -2).join(", ") : "",
        city: parts[parts.length - 2],
        state: stateZip.state,
        zip: stateZip.zip,
      };
    }
  }

  if (parts.length >= 2) {
    const cityStateZip = parseCityStateZip(parts[parts.length - 1]);

    if (cityStateZip) {
      return {
        street,
        street1: parts.length > 2 ? parts.slice(1, -1).join(", ") : "",
        ...cityStateZip,
      };
    }
  }

  return { street: address, street1: "", city: "", state: "", zip: "" };
}

function ClientForm({
  mode,
  initialValues,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  initialValues?: ClientFormValues;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const initialAddress = parseAddress(initialValues?.address);
  const [phone, setPhone] = useState(formatPhoneNumber(initialValues?.phone ?? ""));
  const [street, setStreet] = useState(initialAddress.street);
  const [street1, setStreet1] = useState(initialAddress.street1);
  const [city, setCity] = useState(initialAddress.city);
  const [state, setState] = useState(initialAddress.state);
  const [zip, setZip] = useState(initialAddress.zip);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const combinedAddress = useMemo(
    () => buildAddress({ street, street1, city, state, zip }),
    [street, street1, city, state, zip],
  );

  useEffect(() => {
    const query = [street, city, state, zip].filter(Boolean).join(", ");

    if (query.trim().length < 4) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSuggesting(true);

      try {
        const response = await fetch(
          `/api/address-suggestions?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as AddressSuggestionsResponse;
        setSuggestions(data.suggestions ?? []);
        setShowSuggestions(true);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSuggesting(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [city, state, street, zip]);

  function applySuggestion(suggestion: AddressSuggestion) {
    setStreet(suggestion.street);
    setCity(suggestion.city);
    setState(suggestion.state);
    setZip(suggestion.zip);
    setShowSuggestions(false);
  }

  async function submitClient(formData: FormData) {
    if (mode === "edit") {
      await updateClientAction(formData);
    } else {
      await createClientAction(formData);
    }

    onSaved();
  }

  return (
    <form action={submitClient} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "고객 수정" : "고객 추가"}
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={onCancel}
        >
          닫기
        </button>
      </div>

      {initialValues?.id ? (
        <input type="hidden" name="client_id" value={initialValues.id} />
      ) : null}
      <input type="hidden" name="address" value={combinedAddress} />

      <Field label="Company">
        <input
          className="ui-input"
          name="company_name"
          placeholder="Visual Square…"
          autoComplete="organization"
          defaultValue={initialValues?.companyName ?? ""}
        />
      </Field>
      <Field label="Contact">
        <input
          className="ui-input"
          name="name"
          placeholder="Jane Kim…"
          autoComplete="name"
          required
          defaultValue={initialValues?.name ?? ""}
        />
      </Field>
      <Field label="Email">
        <input
          className="ui-input"
          name="email"
          type="email"
          placeholder="jane@example.com…"
          autoComplete="email"
          spellCheck={false}
          defaultValue={initialValues?.email ?? ""}
        />
      </Field>
      <Field label="Phone">
        <input
          className="ui-input"
          name="phone"
          type="tel"
          placeholder="(201) 555-0123"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(formatPhoneNumber(event.target.value))}
        />
      </Field>

      <div className="space-y-3">
        <div className="relative">
          <Field label="Street">
            <input
              className="ui-input"
              name="address_street"
              placeholder="2151 Lemoine Ave…"
              autoComplete="address-line1"
              value={street}
              onChange={(event) => {
                const value = event.target.value;
                setStreet(value);
                if (value.trim().length < 4) {
                  setSuggestions([]);
                }
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
          </Field>
          {showSuggestions && (suggestions.length > 0 || isSuggesting) ? (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 border border-[var(--border-strong)] bg-white shadow-[0_14px_35px_rgba(20,20,20,0.08)]">
              {isSuggesting ? (
                <p className="px-3 py-2 text-sm text-[var(--muted)]">
                  주소 검색 중…
                </p>
              ) : null}
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  className="block w-full border-t border-[var(--border)] px-3 py-2 text-left text-sm first:border-t-0 hover:bg-[var(--surface)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--coral)]"
                  onClick={() => applySuggestion(suggestion)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <Field label="Street 1">
          <input
            className="ui-input"
            name="address_street_1"
            placeholder="Suite, unit, floor…"
            autoComplete="address-line2"
            value={street1}
            onChange={(event) => setStreet1(event.target.value)}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_5rem_7rem]">
          <Field label="City">
            <input
              className="ui-input"
              name="address_city"
              placeholder="Fort Lee…"
              autoComplete="address-level2"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </Field>
          <Field label="State">
            <input
              className="ui-input uppercase"
              name="address_state"
              placeholder="NJ"
              autoComplete="address-level1"
              maxLength={2}
              value={state}
              onChange={(event) => setState(event.target.value.toUpperCase())}
            />
          </Field>
          <Field label="Zip Code">
            <input
              className="ui-input"
              name="address_zip"
              placeholder="07024"
              autoComplete="postal-code"
              inputMode="numeric"
              value={zip}
              onChange={(event) =>
                setZip(event.target.value.replace(/[^\d-]/g, "").slice(0, 10))
              }
            />
          </Field>
        </div>
      </div>

      <Field label="Memo">
        <textarea
          className="ui-input min-h-20"
          name="memo"
          placeholder="Internal note…"
          autoComplete="off"
          defaultValue={initialValues?.memo ?? ""}
        />
      </Field>

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" className="ui-button ui-button-secondary" onClick={onCancel}>
          취소
        </button>
        <button className="ui-button">
          {mode === "edit" ? "저장" : "추가"}
        </button>
      </div>
    </form>
  );
}

function formatClientPhone(phone: string | null) {
  return phone ? formatPhoneNumber(phone) : "no phone";
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

export function ClientManagement({
  clients,
}: {
  clients: ClientWithRelations[];
}) {
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingClient, setEditingClient] = useState<ClientWithRelations | null>(
    null,
  );

  function closeForm() {
    setFormMode("closed");
    setEditingClient(null);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">고객 목록</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            기존 고객을 먼저 확인하고 필요할 때 추가하거나 수정합니다.
          </p>
        </div>
        <button
          type="button"
          className="ui-button sm:w-auto"
          onClick={() => {
            setEditingClient(null);
            setFormMode("create");
          }}
        >
          고객 추가
        </button>
      </div>

      {formMode !== "closed" ? (
        <ClientForm
          key={editingClient?.id ?? "new-client"}
          mode={formMode === "edit" ? "edit" : "create"}
          initialValues={
            editingClient
              ? {
                  id: editingClient.id,
                  companyName: editingClient.company_name,
                  name: editingClient.name,
                  email: editingClient.email,
                  phone: editingClient.phone,
                  address: editingClient.address,
                  memo: editingClient.memo,
                }
              : undefined
          }
          onCancel={closeForm}
          onSaved={closeForm}
        />
      ) : null}

      <div className="ui-card overflow-hidden">
        {clients.length === 0 ? (
          <div className="border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-8 text-center">
            <p className="font-semibold">고객 없음</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              고객 추가를 눌러 첫 고객을 등록하세요.
            </p>
          </div>
        ) : (
          clients.map((client) => {
            const revenue = client.invoices.reduce(
              (sum, invoice) => sum + toNumber(invoice.total),
              0,
            );
            const outstanding = calculateOutstandingAr(
              client.invoices.map((invoice) => ({
                total: toNumber(invoice.total),
                paidAmount: toNumber(invoice.paid_amount),
                status: invoice.status,
              })),
            );

            return (
              <article
                key={client.id}
                className="grid gap-4 border-b border-[var(--border)] p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px]"
              >
                <div className="min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold">
                        {client.company_name ?? client.name}
                      </h3>
                      <div className="mt-2 space-y-0.5">
                        <DetailLine label="Contact" value={client.name} />
                        <DetailLine label="Email" value={client.email} />
                        <DetailLine
                          label="Phone"
                          value={formatClientPhone(client.phone)}
                        />
                        {client.address ? (
                          <DetailLine label="Address" value={client.address} />
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-sm font-semibold text-[var(--coral-strong)] hover:text-[var(--foreground)]"
                      onClick={() => {
                        setEditingClient(client);
                        setFormMode("edit");
                      }}
                    >
                      수정
                    </button>
                  </div>
                  {client.memo ? (
                    <p className="mt-2 break-words text-sm text-[var(--muted)]">
                      {client.memo}
                    </p>
                  ) : null}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm md:grid-cols-1">
                  <div>
                    <p className="text-xs text-[var(--muted)]">Projects</p>
                    <p className="font-semibold tabular-nums">
                      {client.projects.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Revenue</p>
                    <p className="font-semibold tabular-nums">
                      {formatCurrency(revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">AR</p>
                    <p className="font-semibold tabular-nums">
                      {formatCurrency(outstanding)}
                    </p>
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
