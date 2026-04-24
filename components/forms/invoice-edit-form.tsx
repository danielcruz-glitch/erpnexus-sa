"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { InvoiceRow } from "@/lib/types";

type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Void";
const STATUS_OPTIONS: InvoiceStatus[] = ["Draft", "Sent", "Paid", "Void"];

type Props = { invoice: InvoiceRow };

export function InvoiceEditForm({ invoice }: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number ?? "");
  const [status, setStatus] = useState<InvoiceStatus>((invoice.status as InvoiceStatus) ?? "Draft");
  const [paymentTerms, setPaymentTerms] = useState(invoice.payment_terms_label ?? "Net 30");
  const [dueDate, setDueDate] = useState(invoice.due_date ?? "");
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");

    const supabase = createClient();
    const { error } = await supabase
      .from("invoices")
      .update({
        invoice_number: invoiceNumber,
        status,
        payment_terms_label: paymentTerms,
        due_date: dueDate || null,
        notes,
      })
      .eq("id", invoice.id);

    setSaving(false);
    if (error) {
      setSaveStatus("error");
    } else {
      setSaveStatus("success");
    }
  }

  return (
    <Card className="max-w-3xl p-6">
      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Invoice number</label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full rounded-xl border border-sky-200/20 bg-slate-950/70 px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Payment terms</label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Due date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Invoice notes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {saveStatus === "success" && (
          <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
            Invoice saved successfully.
          </p>
        )}
        {saveStatus === "error" && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            Failed to save. Check your permissions and try again.
          </p>
        )}

        <div className="flex gap-3">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save invoice changes"}
          </Button>
          <a
            href={`/dashboard/invoices/${invoice.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Cancel
          </a>
        </div>
      </div>
    </Card>
  );
}
