import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { daysAlive, formatDate } from "@/lib/utils";
import type { TicketListItem } from "@/lib/types";

export default async function TicketsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("tickets")
    .select("id,ticket_number,title,status,created_at,priority,companies(id,name)")
    .neq("status", "Invoiced")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load tickets: ${error.message}`);
  }

  const tickets = (data ?? []) as TicketListItem[];

  return (
    <div>
      <Topbar
        title="Tickets"
        subtitle="Open, pending, and workflow-driven support queue."
      />

      <div className="mb-5 flex justify-end">
        <Link
          href="/dashboard/tickets/new"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950"
        >
          New ticket
        </Link>
      </div>

      <Card className="overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3">Ticket</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Days Alive</th>
              <th className="px-6 py-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => {
              const alive = daysAlive(ticket.created_at);
              const ageClass =
                alive > 7
                  ? "text-red-300"
                  : alive > 2
                  ? "text-amber-300"
                  : "text-emerald-300";

              return (
                <tr key={ticket.id} className="border-t border-white/5 text-slate-200">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="font-medium text-white hover:text-accent"
                    >
                      {ticket.ticket_number}
                    </Link>
                    <div className="mt-1 text-xs text-slate-400">{ticket.title}</div>
                  </td>

                  <td className="px-6 py-4">{ticket.companies?.[0]?.name ?? "Unassigned"}</td>
                  <td className="px-6 py-4">{ticket.priority}</td>
                  <td className="px-6 py-4">
                    <Badge>{ticket.status}</Badge>
                  </td>
                  <td className={`px-6 py-4 ${ageClass}`}>{alive} days</td>
                  <td className="px-6 py-4">{formatDate(ticket.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
