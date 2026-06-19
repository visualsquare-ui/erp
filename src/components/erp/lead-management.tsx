"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import {
  convertMarketingLeadAction,
  updateMarketingLeadAction,
} from "@/app/(erp)/actions";
import { formatUsDate } from "@/lib/format";
import type { MarketingLeadRow } from "@/types/database";
import type { MarketingLeadStatus } from "@/types/erp";

type LeadManagementProps = {
  leads: MarketingLeadRow[];
  initialStatus?: string;
};

type ParsedLeadMessage = {
  businessType: string | null;
  neededBy: string | null;
  body: string;
};

const statusOptions: { value: MarketingLeadStatus; label: string }[] = [
  { value: "new", label: "신규" },
  { value: "contacted", label: "연락 완료" },
  { value: "quoted", label: "견적" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "spam", label: "Spam" },
];

const serviceLabels: Record<string, string> = {
  web: "Web Design",
  print: "Print Design",
  branding: "Branding",
  restaurant: "Restaurant / Cafe Branding",
  menu: "Menu Design & Printing",
  signage: "Banner, Signage, or Window Graphics",
  "business-card": "Business Cards",
  custom: "Custom Printing",
};

function getLeadSource(lead: MarketingLeadRow) {
  if (lead.utm_source) {
    return lead.utm_source;
  }

  if (!lead.referrer) {
    return "direct";
  }

  try {
    return new URL(lead.referrer).hostname.replace(/^www\./, "");
  } catch {
    return "referral";
  }
}

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function filterUnique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function parseLeadMessage(message: string): ParsedLeadMessage {
  const lines = message.split(/\r?\n/);
  let businessType: string | null = null;
  let neededBy: string | null = null;
  let bodyStartIndex = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const businessTypeMatch = line.match(/^Business type:\s*(.+)$/i);
    const neededByMatch = line.match(/^Needed by:\s*(.+)$/i);

    if (businessTypeMatch) {
      businessType = businessTypeMatch[1];
      bodyStartIndex = index + 1;
      continue;
    }

    if (neededByMatch) {
      neededBy = neededByMatch[1];
      bodyStartIndex = index + 1;
      continue;
    }

    if (line === "" && (businessType || neededBy)) {
      bodyStartIndex = index + 1;
    }

    break;
  }

  if (!businessType && !neededBy) {
    return {
      businessType: null,
      neededBy: null,
      body: message,
    };
  }

  const bodyLines = lines.slice(bodyStartIndex);

  while (bodyLines[0] === "") {
    bodyLines.shift();
  }

  return {
    businessType,
    neededBy,
    body: bodyLines.join("\n").trim() || message,
  };
}

export function LeadManagement({
  leads,
  initialStatus = "all",
}: LeadManagementProps) {
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [query, setQuery] = useState("");
  const sources = useMemo(
    () => filterUnique(leads.map((lead) => getLeadSource(lead))),
    [leads],
  );
  const services = useMemo(
    () => filterUnique(leads.map((lead) => lead.service)),
    [leads],
  );
  const filteredLeads = leads.filter((lead) => {
    const source = getLeadSource(lead);
    const service = lead.service;
    const searchHaystack = [
      lead.name,
      lead.company_name,
      lead.email,
      lead.phone,
      lead.message,
      lead.utm_campaign,
      lead.landing_path,
    ]
      .map(normalize)
      .join(" ");

    return (
      (statusFilter === "all" || lead.status === statusFilter) &&
      (sourceFilter === "all" || source === sourceFilter) &&
      (serviceFilter === "all" || service === serviceFilter) &&
      (!query.trim() || searchHaystack.includes(normalize(query)))
    );
  });

  return (
    <section className="space-y-4">
      <div className="ui-panel grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
        <label className="block space-y-1.5">
          <span className="ui-label">Search</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
              aria-hidden="true"
            />
            <input
              className="ui-input pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Company, email, campaign..."
            />
          </span>
        </label>
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All status" },
            ...statusOptions,
          ]}
        />
        <FilterSelect
          label="Source"
          value={sourceFilter}
          onChange={setSourceFilter}
          options={[
            { value: "all", label: "All sources" },
            ...sources.map((source) => ({ value: source, label: source })),
          ]}
        />
        <FilterSelect
          label="Service"
          value={serviceFilter}
          onChange={setServiceFilter}
          options={[
            { value: "all", label: "All services" },
            ...services.map((service) => ({
              value: service,
              label: serviceLabels[service] ?? service,
            })),
          ]}
        />
      </div>

      {filteredLeads.length === 0 ? (
        <div className="ui-card p-6">
          <h2 className="font-semibold">표시할 리드 없음</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            필터를 조정하거나 visualsquare.com 문의 폼 전환을 기다려 주세요.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="ui-label">{label}</span>
      <select
        className="ui-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LeadRow({ lead }: { lead: MarketingLeadRow }) {
  const source = getLeadSource(lead);
  const converted = Boolean(lead.converted_client_id || lead.converted_job_id);
  const parsedMessage = parseLeadMessage(lead.message);
  const metadata = [
    {
      label: "Created",
      value: formatUsDate(lead.created_at.slice(0, 10)),
    },
    { label: "Landing", value: lead.landing_path },
    { label: "Campaign", value: lead.utm_campaign },
  ];

  return (
    <article className="ui-card grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <LeadStatusBadge status={lead.status} />
          <span className="border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--muted)]">
            {serviceLabels[lead.service] ?? lead.service}
          </span>
          <span className="border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--muted)]">
            {source}
          </span>
        </div>
        <h2 className="mt-3 break-words text-lg font-semibold">
          {lead.company_name ?? lead.name}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {lead.name}
          {lead.email ? ` · ${lead.email}` : ""}
          {lead.phone ? ` · ${lead.phone}` : ""}
        </p>

        {(parsedMessage.businessType || parsedMessage.neededBy) && (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <HighlightDetail
              label="Business type"
              value={parsedMessage.businessType}
            />
            <HighlightDetail label="Needed by" value={parsedMessage.neededBy} />
          </dl>
        )}

        <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
          {parsedMessage.body}
        </p>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
          {metadata.map((item) => (
            <Detail key={item.label} label={item.label} value={item.value} />
          ))}
        </dl>
      </div>

      <div className="space-y-3">
        <form action={updateMarketingLeadAction} className="space-y-3">
          <input type="hidden" name="lead_id" value={lead.id} />
          <label className="block space-y-1.5">
            <span className="ui-label">Status</span>
            <select className="ui-input" name="status" defaultValue={lead.status}>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="ui-label">Lost reason</span>
            <input
              className="ui-input"
              name="lost_reason"
              defaultValue={lead.lost_reason ?? ""}
              placeholder="No budget, duplicate..."
            />
          </label>
          <label className="block space-y-1.5">
            <span className="ui-label">Memo</span>
            <textarea
              className="ui-input min-h-20"
              name="memo"
              defaultValue={lead.memo ?? ""}
              placeholder="Follow-up notes..."
            />
          </label>
          <button className="ui-button ui-button-secondary w-full">
            상태 저장
          </button>
        </form>

        <form action={convertMarketingLeadAction}>
          <input type="hidden" name="lead_id" value={lead.id} />
          <button
            className="ui-button w-full"
            disabled={converted}
            title={converted ? "이미 Client 또는 Job으로 연결됨" : undefined}
          >
            Client + Job 생성
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </article>
  );
}

function HighlightDetail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="ui-label">{label}</dt>
      <dd className="mt-1 break-words font-medium text-[var(--foreground)]">
        {value}
      </dd>
    </div>
  );
}

function LeadStatusBadge({ status }: { status: MarketingLeadStatus }) {
  const label =
    statusOptions.find((option) => option.value === status)?.label ?? status;
  const tone =
    status === "won"
      ? "border-transparent bg-[var(--success)] text-white"
      : status === "lost" || status === "spam"
        ? "border-[#8A1F1F]/25 bg-[#F8E8E8] text-[#8A1F1F]"
        : status === "quoted"
          ? "border-[var(--success)]/25 bg-[#E9F6EF] text-[var(--success)]"
          : status === "contacted"
            ? "border-[var(--info)]/30 bg-[#EDF5FA] text-[var(--info)]"
            : "border-[var(--coral)]/35 bg-[var(--coral-quiet)] text-[var(--coral-strong)]";

  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap border px-2 text-xs font-semibold ${tone}`}
    >
      {label}
    </span>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="font-semibold text-[var(--foreground)]">{label}</dt>
      <dd className="mt-1 break-words">{value}</dd>
    </div>
  );
}
