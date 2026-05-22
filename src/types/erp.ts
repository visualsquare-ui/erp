import type { PaymentTerms } from "@/lib/format";
import type { ProjectType } from "@/lib/project-rules";

export type Client = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
};

export type Vendor = {
  id: string;
  name: string;
  specialty: string;
};

export type ProjectStatus =
  | "quote"
  | "in_progress"
  | "done"
  | "on_hold"
  | "canceled";

export type Project = {
  id: string;
  clientId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  quoteAmount: number;
  description: string;
};

export type TaskStatus = "todo" | "doing" | "review" | "done";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type Invoice = {
  id: string;
  projectId: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: string;
  terms: PaymentTerms;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
};

export type VendorBill = {
  id: string;
  projectId: string;
  vendorId: string;
  dueDate: string;
  amount: number;
  status: "received" | "paid";
};

export type PortfolioAsset = {
  id: string;
  projectId: string;
  kind: "result_photo" | "final_file" | "drive_link";
  title: string;
  thumbnailUrl: string;
  isPortfolio: boolean;
};
