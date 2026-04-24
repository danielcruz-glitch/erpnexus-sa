import { Topbar } from "@/components/layout/topbar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusTable } from "@/components/dashboard/status-table";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TicketListItem } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [openResult, pendingApprovalResult, pendingInvoiceResult, ticketsResult] =
    await Promise.all([
      supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .not("status", "in", '("Resolved","Invoiced")'),
      supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "Pending Invoicing Approval"),
      supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "Pending Invoicing"),
      supabase
        .from("tickets")
        .select("id,ticket_number,title,status,created_at,priority,companies(id,name)")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  if (ticketsResult.error) {
    throw new Error(`Failed to load dashboard tickets: ${ticketsResult.error.message}`);
  }

  const tickets = (ticketsResult.data ?? []) as TicketListItem[];

  return (
    <div>
      <Topbar
        title="Support Insights"
        subtitle="Operational clarity for ERP support, approvals, and invoice readiness."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Open tickets"
          value={String(openResult.count ?? 0)}
          helper="Everything still in play."
        />
        <MetricCard
          label="Pending approval"
          value={String(pendingApprovalResult.count ?? 0)}
          helper="Resolved by users, waiting for support review."
        />
        <MetricCard
          label="Ready for invoice"
          value={String(pendingInvoiceResult.count ?? 0)}
          helper="Approved work logs available for billing."
        />
        <MetricCard
          label="This build"
          value="Fresh"
          helper="New project, clean schema, less regret."
        />
      </section>

      <section className="mt-6">
        <StatusTable tickets={tickets} />
      </section>
    </div>
  );
}
