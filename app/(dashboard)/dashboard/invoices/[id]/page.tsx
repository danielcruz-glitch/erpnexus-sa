import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordPaymentForm } from "@/components/forms/record-payment-form";
import { currency, formatDate } from "@/lib/utils";
import type { InvoiceDetail, Role } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  const admin = createAdminClient();
  let isAdmin = false;
  let isMainStaff = false;

  if (profile?.company_id) {
    const { data: company } = await admin
      .from("companies")
      .select("is_main_account")
      .eq("id", profile.company_id)
      .single();
    const mainAccount = company?.is_main_account ?? false;
    const role = profile?.role as Role;
    isMainStaff = mainAccount && (role === "admin" || role === "support");
    isAdmin = mainAccount && role === "admin";
  }

  const { data, error } = await admin
    .from("invoices")
    .select(
      `*, companies!invoices_company_id_fkey(
         id, name, billing_name,
         billing_address_line_1, billing_address_line_2,
         billing_city, billing_state, billing_zip,
         billing_email
       ),
       invoice_items(*),
       payments(*)`
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const invoice = data as unknown as InvoiceDetail & {
    email_status: string | null;
    email_sent_at: string | null;
    email_error: string | null;
    payments?: Array<{
      id: string;
      amount: number;
      payment_method: string;
      payment_date: string;
      reference_number?: string;
      notes?: string;
    }>;
  };

  const company = invoice.companies?.[0];
  const items = invoice.invoice_items ?? [];
  const payments = invoice.payments ?? [];

  const canEdit = isAdmin && !["Sent", "Paid", "Void"].includes(invoice.status);
  const canRecordPayment = isAdmin && invoice.status === "Sent";

  return (
    <div className="space-y-6">
      <Topbar
        title={`Invoice ${invoice.invoice_number}`}
        subtitle="Review invoice details, line items, email status, and payment."
      />

      {/* Action bar */}
      <div className="flex flex-wrap gap-3">
        {(canEdit || (isAdmin && invoice.status === "Approved")) && (
          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
            <Button type="button">
              {invoice.status === "Approved" ? "Edit / Send" : "Edit invoice"}
            </Button>
          </Link>
        )}
        {isMainStaff && !isAdmin && (
          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
            <Button type="button">View</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* ── Left: invoice body ── */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">{invoice.invoice_number}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {company?.name ?? "Unknown company"} — {formatDate(invoice.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusChip status={invoice.status} />
                {invoice.email_status && (
                  <EmailChip status={invoice.email_status} sentAt={invoice.email_sent_at} />
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Bill to</dt>
                <dd className="mt-1 text-sm text-slate-100">{company?.name ?? "—"}</dd>
                {company?.billing_address_line_1 && (
                  <dd className="text-sm text-slate-400">{company.billing_address_line_1}</dd>
                )}
                {company?.billing_city && (
                  <dd className="text-sm text-slate-400">
                    {[company.billing_city, company.billing_state, company.billing_zip]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                )}
              </div>
              <div>
                <dt className="text-xs text-slate-500">Due date</dt>
                <dd className="mt-1 text-sm text-slate-100">{formatDate(invoice.due_date)}</dd>
                <dt className="mt-3 text-xs text-slate-500">Terms</dt>
                <dd className="mt-1 text-sm text-slate-100">
                  {invoice.payment_terms_label ?? "Net 30"}
                </dd>
              </div>
            </div>

            {/* Email error banner */}
            {invoice.email_status === "failed" && invoice.email_error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm font-semibold text-red-400">Email delivery failed</p>
                <p className="mt-1 text-xs text-red-300">{invoice.email_error}</p>
                {isAdmin && (
                  <p className="mt-2 text-xs text-slate-400">
                    Fix the issue, set status back to <strong>Approved</strong>, and resend from the edit page.
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Line items */}
          <Card className="overflow-hidden">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-center">Hrs</th>
                  <th className="px-6 py-3 text-right">Rate</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No line items yet.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t border-white/5 text-slate-200">
                      <td className="px-6 py-4">{item.description}</td>
                      <td className="px-6 py-4 text-center">{item.hours}</td>
                      <td className="px-6 py-4 text-right">{currency(item.rate)}</td>
                      <td className="px-6 py-4 text-right">{currency(item.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t border-white/10">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm text-slate-400">
                    Subtotal
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-slate-200">
                    {currency(invoice.subtotal)}
                  </td>
                </tr>
                {invoice.tax_amount > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-2 text-right text-sm text-slate-400">
                      Tax
                    </td>
                    <td className="px-6 py-2 text-right text-sm text-slate-200">
                      {currency(invoice.tax_amount)}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-white/10">
                  <td colSpan={3} className="px-6 py-4 text-right font-semibold text-white">
                    Total
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-white">
                    {currency(invoice.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {invoice.notes && (
            <Card className="p-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-400">Notes</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-300">{invoice.notes}</p>
            </Card>
          )}
        </div>

        {/* ── Right: status / payment / remit ── */}
        <div className="space-y-4">
          {/* Payment status */}
          <Card className="p-5">
            <h3 className="mb-3 text-base font-semibold text-white">Payment status</h3>
            {invoice.status === "Paid" ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-green-400">✓ Paid</p>
                <p className="text-xs text-slate-400">
                  Method: {invoice.payment_method ?? "—"}
                </p>
                <p className="text-xs text-slate-400">Date: {formatDate(invoice.paid_at)}</p>
                {invoice.payment_reference && (
                  <p className="text-xs text-slate-400">Ref: {invoice.payment_reference}</p>
                )}
                {invoice.payment_notes && (
                  <p className="text-xs text-slate-400">Notes: {invoice.payment_notes}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {invoice.status === "Void"
                  ? "Voided — no payment applicable."
                  : `Outstanding: ${currency(invoice.total_amount)}`}
              </p>
            )}
          </Card>

          {/* Record payment */}
          {canRecordPayment && (
            <Card className="p-5">
              <h3 className="mb-1 text-base font-semibold text-white">Record payment</h3>
              <p className="mb-4 text-sm text-slate-400">
                Mark this invoice as paid and log payment details.
              </p>
              <RecordPaymentForm
                invoiceId={invoice.id}
                totalAmount={invoice.total_amount}
                onPaid={() => {
                  window.location.reload();
                }}
              />
            </Card>
          )}

          {/* Payment history */}
          {payments.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-400">Payment history</h3>
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-white">{currency(p.amount)}</span>
                      <span className="text-slate-400">{formatDate(p.payment_date)}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {p.payment_method}
                      {p.reference_number ? ` — ${p.reference_number}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Remit to */}
          {invoice.remit_to_name && (
            <Card className="p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Remit to
              </h3>
              <p className="text-sm text-slate-300">{invoice.remit_to_name}</p>
              {invoice.remit_to_address_line_1 && (
                <p className="text-sm text-slate-400">{invoice.remit_to_address_line_1}</p>
              )}
              {invoice.remit_to_city && (
                <p className="text-sm text-slate-400">
                  {[invoice.remit_to_city, invoice.remit_to_state, invoice.remit_to_zip]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft:    "bg-slate-500/20 text-slate-300",
    Approved: "bg-blue-500/20 text-blue-300",
    Sending:  "bg-amber-500/20 text-amber-300",
    Sent:     "bg-green-500/20 text-green-300",
    Failed:   "bg-red-500/20 text-red-300",
    Paid:     "bg-emerald-500/20 text-emerald-300",
    Void:     "bg-zinc-500/20 text-zinc-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${map[status] ?? "bg-white/10 text-slate-300"}`}
    >
      {status}
    </span>
  );
}

function EmailChip({ status, sentAt }: { status: string; sentAt: string | null }) {
  const map: Record<string, string> = {
    pending: "bg-slate-500/20 text-slate-400",
    sending: "bg-amber-500/20 text-amber-300",
    sent:    "bg-teal-500/20 text-teal-300",
    failed:  "bg-red-500/20 text-red-300",
  };
  const label =
    status === "sent" && sentAt
      ? `Email sent ${formatDate(sentAt)}`
      : `Email: ${status}`;
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${map[status] ?? "bg-white/10 text-slate-300"}`}
    >
      {label}
    </span>
  );
}
