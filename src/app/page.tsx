import { Dashboard } from "@/components/dashboard";
import { AppShell } from "@/components/app-shell";
import { getDashboardData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardData();

  return (
    <AppShell userEmail={data.user.email ?? "Staff"} activePath="/">
      <Dashboard data={data} />
    </AppShell>
  );
}
