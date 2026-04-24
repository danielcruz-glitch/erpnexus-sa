import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { currency, formatDate } from "@/lib/utils";
import type { InvoiceListItem } from "@/lib/types";

export default async function InvoicesPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("id,invoice_number,status,total_amount,created_at,due_date,companies(id,name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load invoices: ${error.message}`);
  }

  const invoices = (data ?? []) as InvoiceListItem[];

  return (
    <div>
      <Topbar
        title="Invoices"
        subtitle="Clean billing records tied to approved work."
      />

      <Card className="overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3">Invoice</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Due</th>
              <th className="px-6 py-3">Total</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-white/5 text-slate-200">
                <td className="px-6 py-4">
                  <Link
                    className="font-medium text-white hover:text-accent"
                    href={`/dashboard/invoices/${invoice.id}`}
                  >
                    {invoice.invoice_number}
                  </Link>
                </td>
                <td className="px-6 py-4">{invoice.companies?.[0]?.name ?? "Unassigned"}</td>
                <td className="px-6 py-4">{invoice.status}</td>
                <td className="px-6 py-4">{formatDate(invoice.created_at)}</td>
                <td className="px-6 py-4">{formatDate(invoice.due_date)}</td>
                <td className="px-6 py-4">{currency(Number(invoice.total_amount ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
