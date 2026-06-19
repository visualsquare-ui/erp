import type { ProjectType } from "@/lib/project-rules";
import type { MarketingLeadStatus } from "@/types/erp";

type LeadSummaryInput = {
  created_at: string;
  status: MarketingLeadStatus;
};

type ClientMatchInput = {
  id: string;
  email: string | null;
  phone: string | null;
};

type LeadMatchInput = {
  email: string | null;
  phone: string | null;
};

type LeadConversionInput = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  service: string;
  message: string;
};

export type LeadStatusSummary = Record<MarketingLeadStatus, number> & {
  total: number;
};

const DEFAULT_SUMMARY: LeadStatusSummary = {
  total: 0,
  new: 0,
  contacted: 0,
  quoted: 0,
  won: 0,
  lost: 0,
  spam: 0,
};

const SERVICE_TYPE_BY_VALUE: Record<string, ProjectType> = {
  web: "web",
  print: "print",
  branding: "branding",
  custom: "print",
};

const SERVICE_LABEL_BY_VALUE: Record<string, string> = {
  web: "Web design",
  print: "Print",
  branding: "Branding",
  custom: "Custom print",
};

function normalizeEmail(value: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizePhone(value: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}

function isRecent(createdAt: string, now: Date) {
  const createdTime = new Date(createdAt).getTime();
  const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  return Number.isFinite(createdTime) && createdTime >= cutoff;
}

export function summarizeRecentLeads(
  leads: LeadSummaryInput[],
  now = new Date(),
): LeadStatusSummary {
  return leads.reduce<LeadStatusSummary>((summary, lead) => {
    if (!isRecent(lead.created_at, now)) {
      return summary;
    }

    summary.total += 1;
    summary[lead.status] += 1;

    return summary;
  }, { ...DEFAULT_SUMMARY });
}

export function findExistingClientForLead<T extends ClientMatchInput>(
  clients: T[],
  lead: LeadMatchInput,
) {
  const leadEmail = normalizeEmail(lead.email);
  const leadPhone = normalizePhone(lead.phone);

  if (leadEmail) {
    const emailMatch = clients.find(
      (client) => normalizeEmail(client.email) === leadEmail,
    );

    if (emailMatch) {
      return emailMatch;
    }
  }

  if (!leadPhone) {
    return null;
  }

  return (
    clients.find((client) => normalizePhone(client.phone) === leadPhone) ?? null
  );
}

export function getMarketingLeadProjectType(service: string): ProjectType {
  return SERVICE_TYPE_BY_VALUE[service] ?? "print";
}

export function getMarketingLeadServiceLabel(service: string) {
  return SERVICE_LABEL_BY_VALUE[service] ?? "Website";
}

export function buildLeadConversionDraft({
  lead,
  clientId,
  today,
}: {
  lead: LeadConversionInput;
  clientId: string;
  today: string;
}) {
  const displayName = lead.company_name ?? lead.name;
  const serviceLabel = getMarketingLeadServiceLabel(lead.service);

  return {
    clientInsert: {
      name: lead.name,
      company_name: lead.company_name,
      email: lead.email,
      phone: lead.phone,
      address: null,
      memo: `Created from website lead ${lead.id}.`,
    },
    jobInsert: {
      client_id: clientId,
      project_id: null,
      name: `${serviceLabel} lead - ${displayName}`,
      type: getMarketingLeadProjectType(lead.service),
      status: "quote" as const,
      start_date: today,
      due_date: null,
      description: lead.message,
      quote_amount: 0,
    },
    leadUpdate: {
      status: "quoted" as const,
      converted_client_id: clientId,
    },
  };
}
