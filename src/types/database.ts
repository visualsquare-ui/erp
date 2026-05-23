import type { PaymentTerms } from "@/lib/format";
import type { ProjectType } from "@/lib/project-rules";
import type { InvoiceStatus, ProjectStatus, TaskStatus } from "@/types/erp";

export type ClientRow = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type VendorRow = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  memo: string | null;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  client_id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  description: string | null;
  quote_amount: string | number;
  created_at: string;
  updated_at: string;
  clients?: Pick<ClientRow, "company_name" | "name"> | null;
};

export type JobRow = {
  id: string;
  client_id: string;
  project_id: string | null;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  description: string | null;
  quote_amount: string | number;
  created_at: string;
  updated_at: string;
  clients?: Pick<ClientRow, "company_name" | "name"> | null;
  projects?: Pick<ProjectRow, "name" | "type"> | null;
};

export type TaskRow = {
  id: string;
  project_id: string;
  title: string;
  assignee: string | null;
  status: TaskStatus;
  due_date: string | null;
  sort_order: number;
  created_at: string;
};

export type WorkOrderRow = {
  id: string;
  project_id: string;
  spec: string | null;
  requirements: string | null;
  included_revisions: number;
  created_at: string;
};

export type ProofVersionRow = {
  id: string;
  work_order_id: string;
  version: number;
  file_url: string | null;
  client_approved: boolean;
  approved_at: string | null;
  is_extra_revision: boolean;
  memo: string | null;
  created_at: string;
};

export type AssetRow = {
  id: string;
  project_id: string;
  work_order_id: string | null;
  kind: "result_photo" | "final_file" | "drive_link";
  title: string;
  storage_url: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  is_portfolio: boolean;
  memo: string | null;
  created_at: string;
  projects?: Pick<ProjectRow, "name" | "type"> | null;
};

export type InvoiceRow = {
  id: string;
  project_id: string | null;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  terms: PaymentTerms;
  due_date: string;
  status: InvoiceStatus;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  paid_amount: string | number;
  paid_date: string | null;
  created_at: string;
  clients?: Pick<ClientRow, "company_name" | "name" | "email" | "address"> | null;
  projects?: Pick<ProjectRow, "name"> | null;
};

export type InvoiceItemRow = {
  id: string;
  invoice_id: string;
  purchase_order_id: string | null;
  job_id: string | null;
  description: string;
  quantity: string | number;
  unit_price: string | number;
  amount: string | number;
  is_taxable: boolean;
  tax_rate: string | number;
};

export type PurchaseOrderRow = {
  id: string;
  project_id: string | null;
  vendor_id: string;
  po_number: string;
  order_date: string;
  expected_date: string | null;
  spec: string | null;
  amount: string | number;
  status: "ordered" | "producing" | "received" | "canceled";
  created_at: string;
  vendors?: Pick<VendorRow, "name"> | null;
  projects?: Pick<ProjectRow, "name" | "type"> | null;
};

export type VendorBillRow = {
  id: string;
  project_id: string | null;
  vendor_id: string;
  purchase_order_id: string | null;
  bill_number: string | null;
  received_date: string;
  due_date: string | null;
  amount: string | number;
  status: "received" | "paid";
  paid_date: string | null;
  file_url: string | null;
  created_at: string;
  vendors?: Pick<VendorRow, "name"> | null;
  projects?: Pick<ProjectRow, "name" | "type"> | null;
};
