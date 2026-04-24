import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency, formatDate } from "@/lib/utils";
import type { InvoiceRow } from "@/lib/types";

type InvoiceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*, companies(name)")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const invoice = data as InvoiceRow & {
    companies?: { name: string }[] | null;
  };

  return (
    <div className="space-y-6">
      <Topbar
        title={`Invoice ${invoice.invoice_number ?? ""}`}
        subtitle="Review invoice details, billing status, and company assignment."
      />

      <div className="flex flex-wrap gap-3">
        <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
          <Button type="button">Edit invoice</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-1 text-sm text-slate-400">Invoice Number</div>
            <div className="text-white">
              {invoice.invoice_number ?? "N/A"}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-slate-400">Status</div>
            <div className="text-white">{invoice.status ?? "N/A"}</div>
          </div>

          <div>
            <div className="mb-1 text-sm text-slate-400">Company</div>
            <div className="text-white">
              {invoice.companies?.[0]?.name ?? "Unassigned"}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-slate-400">Total</div>
            <div className="text-white">
              {currency(Number(invoice.total_amount ?? 0))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-slate-400">Created</div>
            <div className="text-white">
              {invoice.created_at ? formatDate(invoice.created_at) : "N/A"}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-slate-400">Due Date</div>
            <div className="text-white">
              {invoice.due_date ? formatDate(invoice.due_date) : "N/A"}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-1 text-sm text-slate-400">Notes</div>
          <div className="whitespace-pre-wrap text-white">
            {invoice.notes ?? "No notes"}
          </div>
        </div>
      </Card>
    </div>
  );
}