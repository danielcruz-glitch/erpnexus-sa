import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { daysAlive, formatDate } from "@/lib/utils";
import type { TicketListItem } from "@/lib/types";

type StatusTableProps = {
  tickets: TicketListItem[];
};

export function StatusTable({ tickets }: StatusTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Active ticket stream</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3">Ticket</th>
              <th className="px-6 py-3">Company</th>
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
      </div>
    </Card>
  );
}
