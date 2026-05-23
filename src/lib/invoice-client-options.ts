type InvoiceClientOptionInput = {
  id: string;
  name: string;
  company_name: string | null;
};

export function getInvoiceClientOptions(clients: InvoiceClientOptionInput[]) {
  return clients.map((client) => ({
    id: client.id,
    label: client.company_name ?? client.name,
  }));
}
