import { AppShell } from "@/components/erp/app-shell";
import { Dashboard } from "@/components/erp/dashboard";
import { getDashboardData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AppShell userEmail={data.user.email ?? "Staff"} activePath="/dashboard">
      <Dashboard data={data} />
    </AppShell>
  );
}
