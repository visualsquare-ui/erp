import { roundMoney, toNumber } from "./erp-calculations";

type SearchableClient = {
  company_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

type ClientJobInput = {
  id: string;
  client_id: string;
  name: string;
  due_date: string | null;
  created_at: string;
  quote_amount: string | number;
};

type InvoiceInput = {
  invoice_items?: {
    job_id: string | null;
    amount: string | number;
  }[];
};

type PurchaseOrderInput = {
  spec: string | null;
};

export type ClientJobSummary = {
  id: string;
  name: string;
  date: string | null;
  quote: number;
  cost: number;
  sales: number;
  profit: number;
  marginRate: number;
};

function normalizeSearchValue(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/\D/g, "");
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

export function filterClientsByQuery<T extends SearchableClient>(
  clients: T[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const numericQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return clients;
  }

  return clients.filter((client) => {
    const textHaystack = [
      client.company_name,
      client.name,
      client.email,
      client.phone,
      client.address,
    ]
      .map(normalizeSearchText)
      .join(" ");
    const numericHaystack = normalizeSearchValue(client.phone);

    return (
      textHaystack.includes(normalizedQuery) ||
      (numericQuery.length > 0 && numericHaystack.includes(numericQuery))
    );
  });
}

function parsePurchaseOrderItems(spec: string | null) {
  if (!spec) {
    return [];
  }

  try {
    const parsed = JSON.parse(spec) as {
      items?: {
        jobId?: string | null;
        unitPrice?: string | number;
        qty?: string | number;
      }[];
    };

    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

function calculateJobCost(jobId: string, purchaseOrders: PurchaseOrderInput[]) {
  return roundMoney(
    purchaseOrders.reduce((orderSum, order) => {
      const items = parsePurchaseOrderItems(order.spec);

      return (
        orderSum +
        items
          .filter((item) => item.jobId === jobId)
          .reduce(
            (itemSum, item) =>
              itemSum + toNumber(item.unitPrice) * (toNumber(item.qty) || 0),
            0,
          )
      );
    }, 0),
  );
}

function calculateJobSales(jobId: string, invoices: InvoiceInput[]) {
  return roundMoney(
    invoices.reduce(
      (invoiceSum, invoice) =>
        invoiceSum +
        (invoice.invoice_items ?? [])
          .filter((item) => item.job_id === jobId)
          .reduce((itemSum, item) => itemSum + toNumber(item.amount), 0),
      0,
    ),
  );
}

export function summarizeRecentClientJobs({
  clientId,
  jobs,
  invoices,
  purchaseOrders,
}: {
  clientId: string;
  jobs: ClientJobInput[];
  invoices: InvoiceInput[];
  purchaseOrders: PurchaseOrderInput[];
}): ClientJobSummary[] {
  return jobs
    .filter((job) => job.client_id === clientId)
    .sort((a, b) =>
      (b.due_date ?? b.created_at).localeCompare(a.due_date ?? a.created_at),
    )
    .slice(0, 5)
    .map((job) => {
      const cost = calculateJobCost(job.id, purchaseOrders);
      const sales = calculateJobSales(job.id, invoices);
      const profit = roundMoney(sales - cost);

      return {
        id: job.id,
        name: job.name,
        date: job.due_date ?? job.created_at,
        quote: toNumber(job.quote_amount),
        cost,
        sales,
        profit,
        marginRate: sales > 0 ? roundMoney(profit / sales) : 0,
      };
    });
}
