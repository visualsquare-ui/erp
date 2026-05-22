"use client";

import { useEffect, useMemo, useState } from "react";

import { createClientAction } from "@/app/actions";

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
}: {
  street: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
}) {
  const line1 = street.trim();
  const line2 = street1.trim();
  const cityStateZip = [city.trim(), state.trim(), zip.trim()]
    .filter(Boolean)
    .join(" ");

  return [line1, line2, cityStateZip].filter(Boolean).join(", ");
}

export function ClientCreateForm() {
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [street1, setStreet1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
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

  return (
    <form action={createClientAction} className="ui-panel space-y-4">
      <h2 className="text-sm font-semibold">고객 추가</h2>
      <Field label="Company">
        <input
          className="ui-input"
          name="company_name"
          placeholder="Visual Square…"
          autoComplete="organization"
        />
      </Field>
      <Field label="Contact">
        <input
          className="ui-input"
          name="name"
          placeholder="Jane Kim…"
          autoComplete="name"
          required
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

      <input type="hidden" name="address" value={combinedAddress} />

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
        />
      </Field>
      <button className="ui-button w-full">저장</button>
    </form>
  );
}
