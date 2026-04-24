import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { currency, formatDate } from "@/lib/utils";
import type { InvoiceListItem } from "@/lib/types";

export default async function InvoicesPage() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("invoices")
    .select(
      "id,invoice_number,status,total_amount,created_at,due_date,email_status,companies!invoices_company_id_fkey(id,name)"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load invoices: ${error.message}`);

  const invoices = (data ?? []) as (InvoiceListItem & { email_status: string | null })[];

  const statusColor: Record<string, string> = {
    Draft:    "bg-slate-500/20 text-slate-300",
    Approved: "bg-blue-500/20 text-blue-300",
    Sending:  "bg-amber-500/20 text-amber-300",
    Sent:     "bg-green-500/20 text-green-300",
    Failed:   "bg-red-500/20 text-red-300",
    Paid:     "bg-emerald-500/20 text-emerald-300",
    Void:     "bg-zinc-500/20 text-zinc-400",
  };

  return (
    <div>
      <Topbar title="Invoices" subtitle="System-controlled invoice workflow — Draft → Approved → Sent → Paid." />

      <Card className="overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3">Invoice</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Due</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                  No invoices yet.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-white/5 text-slate-200 hover:bg-white/3">
                  <td className="px-6 py-4">
                    <Link
                      className="font-medium text-white hover:text-accent"
                      href={`/dashboard/invoices/${invoice.id}`}
                    >
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{invoice.companies?.[0]?.name ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[invoice.status] ?? "bg-white/10 text-slate-300"}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {invoice.email_status ? (
                      <span className="text-xs text-slate-400">{invoice.email_status}</span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{formatDate(invoice.created_at)}</td>
                  <td className="px-6 py-4">{formatDate(invoice.due_date)}</td>
                  <td className="px-6 py-4 text-right">{currency(Number(invoice.total_amount ?? 0))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
