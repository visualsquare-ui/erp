import { redirect } from "next/navigation";

import { getLoginRedirectPath } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";
import type {
  AssetRow,
  ClientRow,
  InvoiceItemRow,
  InvoiceRow,
  JobRow,
  ProjectRow,
  ProofVersionRow,
  PurchaseOrderRow,
  TaskRow,
  VendorBillRow,
  VendorRow,
  WorkOrderRow,
} from "@/types/database";

function isPurchaseOrderDeleted(order: PurchaseOrderRow) {
  if (!order.spec) {
    return false;
  }

  try {
    const spec = JSON.parse(order.spec) as {
      meta?: { deletedAt?: string };
    };

    return Boolean(spec.meta?.deletedAt);
  } catch {
    return false;
  }
}

function throwIfSupabaseError(
  error: { message: string } | null,
  label: string,
) {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function getMissingJobsTableMessage(error: { message: string } | null) {
  if (!error) {
    return null;
  }

  if (error.message.includes("public.jobs")) {
    return "Supabase에 jobs 테이블이 아직 없습니다. supabase/migrations/202605230002_jobs_first_schema.sql 을 실행해 주세요.";
  }

  return null;
}

export async function getAuthedSupabase(pathname = "/") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getLoginRedirectPath(pathname));
  }

  return { supabase, user };
}

export async function getDashboardData() {
  const { supabase, user } = await getAuthedSupabase("/");
  const [
    clientsResult,
    projectsResult,
    tasksResult,
    jobsResult,
    invoicesResult,
    billsResult,
    assetsResult,
  ] = await Promise.all([
    supabase.from("clients").select("*").order("created_at"),
    supabase.from("projects").select("*, clients(company_name, name)").order("due_date"),
    supabase.from("tasks").select("*").order("due_date"),
    supabase.from("jobs").select("*, clients(company_name, name), projects(name, type)").order("due_date"),
    supabase
      .from("invoices")
      .select("*, clients(company_name, name, email, address), projects(name)")
      .order("due_date"),
    supabase.from("vendor_bills").select("*, vendors(name), projects(name, type)").order("due_date"),
    supabase.from("assets").select("*, projects(name, type)").eq("is_portfolio", true).order("created_at"),
  ]);

  return {
    user,
    clients: (clientsResult.data ?? []) as ClientRow[],
    projects: (projectsResult.data ?? []) as ProjectRow[],
    tasks: (tasksResult.data ?? []) as TaskRow[],
    jobs: (jobsResult.data ?? []) as JobRow[],
    invoices: (invoicesResult.data ?? []) as InvoiceRow[],
    bills: (billsResult.data ?? []) as VendorBillRow[],
    assets: (assetsResult.data ?? []) as AssetRow[],
  };
}

export async function getClientsPageData() {
  const { user, supabase } = await getAuthedSupabase("/clients");
  const [clientsResult, jobsResult, invoicesResult, purchaseOrdersResult] =
    await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("company_name", { ascending: true }),
      supabase.from("jobs").select("*").order("due_date", { ascending: false }),
      supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .order("issue_date", { ascending: false }),
      supabase.from("purchase_orders").select("*").order("order_date", {
        ascending: false,
      }),
    ]);

  return {
    user,
    clients: (clientsResult.data ?? []) as ClientRow[],
    jobs: (jobsResult.data ?? []) as JobRow[],
    invoices: (invoicesResult.data ?? []) as (InvoiceRow & {
      invoice_items: InvoiceItemRow[];
    })[],
    purchaseOrders: (purchaseOrdersResult.data ?? []) as PurchaseOrderRow[],
  };
}

export async function getJobsPageData() {
  const { user, supabase } = await getAuthedSupabase("/jobs");
  const [clientsResult, projectsResult, jobsResult] = await Promise.all([
    supabase.from("clients").select("*").order("company_name"),
    supabase.from("projects").select("*, clients(company_name, name)").order("name"),
    supabase
      .from("jobs")
      .select("*, clients(company_name, name), projects(name, type)")
      .order("due_date", { ascending: true }),
  ]);

  throwIfSupabaseError(clientsResult.error, "Clients 조회 실패");
  throwIfSupabaseError(projectsResult.error, "Project groups 조회 실패");
  const setupError = getMissingJobsTableMessage(jobsResult.error);

  if (!setupError) {
    throwIfSupabaseError(jobsResult.error, "Jobs 조회 실패");
  }

  return {
    user,
    clients: (clientsResult.data ?? []) as ClientRow[],
    projects: (projectsResult.data ?? []) as ProjectRow[],
    jobs: (jobsResult.data ?? []) as JobRow[],
    setupError,
  };
}

export async function getProjectsPageData() {
  const { user, supabase } = await getAuthedSupabase("/projects");
  const [clientsResult, projectsResult] = await Promise.all([
    supabase.from("clients").select("*").order("company_name"),
    supabase
      .from("projects")
      .select("*, clients(company_name, name), tasks(id, status), invoices(total, paid_amount, status), vendor_bills(amount, status)")
      .order("due_date", { ascending: true }),
  ]);

  return {
    user,
    clients: (clientsResult.data ?? []) as ClientRow[],
    projects: (projectsResult.data ?? []) as (ProjectRow & {
      tasks: TaskRow[];
      invoices: InvoiceRow[];
      vendor_bills: VendorBillRow[];
    })[],
  };
}

export async function getProjectDetailData(id: string) {
  const { user, supabase } = await getAuthedSupabase(`/projects/${id}`);
  const [
    projectResult,
    clientsResult,
    vendorsResult,
    tasksResult,
    workOrdersResult,
    proofsResult,
    assetsResult,
    invoicesResult,
    billsResult,
    purchaseOrdersResult,
  ] = await Promise.all([
    supabase.from("projects").select("*, clients(company_name, name)").eq("id", id).single(),
    supabase.from("clients").select("*").order("company_name"),
    supabase.from("vendors").select("*").order("name"),
    supabase.from("tasks").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("work_orders").select("*").eq("project_id", id).order("created_at"),
    supabase.from("proof_versions").select("*").order("version"),
    supabase.from("assets").select("*").eq("project_id", id).order("created_at"),
    supabase.from("invoices").select("*, invoice_items(*)").eq("project_id", id).order("issue_date"),
    supabase.from("vendor_bills").select("*, vendors(name)").eq("project_id", id).order("received_date"),
    supabase.from("purchase_orders").select("*, vendors(name)").eq("project_id", id).order("order_date"),
  ]);

  if (!projectResult.data) {
    redirect("/projects");
  }

  return {
    user,
    project: projectResult.data as ProjectRow,
    clients: (clientsResult.data ?? []) as ClientRow[],
    vendors: (vendorsResult.data ?? []) as VendorRow[],
    tasks: (tasksResult.data ?? []) as TaskRow[],
    workOrders: (workOrdersResult.data ?? []) as WorkOrderRow[],
    proofs: (proofsResult.data ?? []) as ProofVersionRow[],
    assets: (assetsResult.data ?? []) as AssetRow[],
    invoices: (invoicesResult.data ?? []) as (InvoiceRow & { invoice_items: InvoiceItemRow[] })[],
    bills: (billsResult.data ?? []) as VendorBillRow[],
    purchaseOrders: ((purchaseOrdersResult.data ?? []) as PurchaseOrderRow[]).filter(
      (order) => !isPurchaseOrderDeleted(order),
    ),
  };
}

export async function getInvoicesPageData() {
  const { user, supabase } = await getAuthedSupabase("/invoices");
  const [clientsResult, projectsResult, purchaseOrdersResult, invoicesResult] =
    await Promise.all([
    supabase.from("clients").select("*").order("company_name"),
    supabase.from("projects").select("*, clients(company_name, name)").order("name"),
    supabase
      .from("purchase_orders")
      .select("*, vendors(name), projects(name, type)")
      .order("order_date", { ascending: false }),
    supabase
      .from("invoices")
      .select("*, clients(company_name, name, email, address), projects(name), invoice_items(*)")
      .order("issue_date", { ascending: false }),
  ]);

  return {
    user,
    clients: (clientsResult.data ?? []) as ClientRow[],
    projects: (projectsResult.data ?? []) as ProjectRow[],
    purchaseOrders: ((purchaseOrdersResult.data ?? []) as PurchaseOrderRow[]).filter(
      (order) => !isPurchaseOrderDeleted(order),
    ),
    invoices: (invoicesResult.data ?? []) as (InvoiceRow & { invoice_items: InvoiceItemRow[] })[],
  };
}

export async function getPurchasingPageData() {
  const { user, supabase } = await getAuthedSupabase("/purchasing");
  const [
    clientsResult,
    vendorsResult,
    projectsResult,
    jobsResult,
    ordersResult,
    billsResult,
  ] =
    await Promise.all([
    supabase.from("clients").select("*").order("company_name"),
    supabase.from("vendors").select("*").order("name"),
    supabase.from("projects").select("*, clients(company_name, name)").order("name"),
    supabase.from("jobs").select("*, clients(company_name, name), projects(name, type)").order("name"),
    supabase.from("purchase_orders").select("*, vendors(name), projects(name, type)").order("order_date", { ascending: false }),
    supabase.from("vendor_bills").select("*, vendors(name), projects(name, type)").order("received_date", { ascending: false }),
  ]);

  const jobsSetupError = getMissingJobsTableMessage(jobsResult.error);

  if (!jobsSetupError) {
    throwIfSupabaseError(jobsResult.error, "Jobs 조회 실패");
  }

  return {
    user,
    clients: (clientsResult.data ?? []) as ClientRow[],
    vendors: (vendorsResult.data ?? []) as VendorRow[],
    projects: (projectsResult.data ?? []) as ProjectRow[],
    jobs: (jobsResult.data ?? []) as JobRow[],
    jobsSetupError,
    purchaseOrders: ((ordersResult.data ?? []) as PurchaseOrderRow[]).filter(
      (order) => !isPurchaseOrderDeleted(order),
    ),
    bills: (billsResult.data ?? []) as VendorBillRow[],
  };
}

export async function getVendorsPageData() {
  const { user, supabase } = await getAuthedSupabase("/vendors");
  const { data } = await supabase
    .from("vendors")
    .select("*, purchase_orders(id, amount), vendor_bills(id, amount, status)")
    .order("name", { ascending: true });

  return {
    user,
    vendors: (data ?? []) as (VendorRow & {
      purchase_orders: PurchaseOrderRow[];
      vendor_bills: VendorBillRow[];
    })[],
  };
}

export async function getPortfolioPageData() {
  const { user, supabase } = await getAuthedSupabase("/portfolio");
  const [projectsResult, assetsResult] = await Promise.all([
    supabase.from("projects").select("*, clients(company_name, name)").order("name"),
    supabase.from("assets").select("*, projects(name, type)").eq("is_portfolio", true).order("created_at", { ascending: false }),
  ]);

  return {
    user,
    projects: (projectsResult.data ?? []) as ProjectRow[],
    assets: (assetsResult.data ?? []) as AssetRow[],
  };
}
