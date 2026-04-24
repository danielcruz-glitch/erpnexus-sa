"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { InvoiceRow, InvoiceStatus } from "@/lib/types";

// Statuses an admin can manually set — Sending/Sent/Failed are system-controlled
const EDITABLE_STATUS_OPTIONS: InvoiceStatus[] = ["Draft", "Approved", "Void"];

type Props = { invoice: InvoiceRow; isAdmin: boolean };

export function InvoiceEditForm({ invoice, isAdmin }: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number ?? "");
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status as InvoiceStatus ?? "Draft");
  const [paymentTerms, setPaymentTerms] = useState(invoice.payment_terms_label ?? "Net 30");
  const [dueDate, setDueDate] = useState(invoice.due_date ?? "");
  const [notes, setNotes] = useState(invoice.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error" | "no_email" | "not_approved">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // The current status shown to the user (updates after successful save)
  const [liveStatus, setLiveStatus] = useState<InvoiceStatus>(invoice.status as InvoiceStatus ?? "Draft");

  const isSystemControlled = ["Sending", "Sent", "Failed"].includes(liveStatus);
  const canSend = isAdmin && liveStatus === "Approved";
  const canEdit = isAdmin && !["Sent", "Paid", "Void"].includes(liveStatus);

  async function handleSave() {
    if (!isAdmin) return;
    setSaving(true);
    setSaveStatus("idle");
    setErrorMsg("");

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
      setErrorMsg(error.message);
    } else {
      setSaveStatus("success");
      setLiveStatus(status);
    }
  }

  async function handleSend() {
    if (!isAdmin) return;

    if (liveStatus !== "Approved") {
      setSendStatus("not_approved");
      return;
    }

    setSending(true);
    setSendStatus("idle");
    setErrorMsg("");

    const res = await fetch("/api/invoices/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: invoice.id }),
    });

    const json = (await res.json()) as { error?: string };
    setSending(false);

    if (!res.ok) {
      if (json.error?.includes("billing email")) {
        setSendStatus("no_email");
      } else {
        setSendStatus("error");
        setErrorMsg(json.error ?? "Failed to send invoice.");
      }
      return;
    }

    setSendStatus("success");
    setTimeout(() => {
      window.location.href = `/dashboard/invoices/${invoice.id}`;
    }, 1800);
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-3xl p-6">
        <p className="text-sm text-slate-400">Only Main Account Admin can edit invoices.</p>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl p-6">
      <div className="grid gap-5">

        {/* Status banner */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3">
          <span className="text-sm text-slate-400">Current status:</span>
          <StatusChip status={liveStatus} />
          {isSystemControlled && (
            <span className="text-xs text-slate-500">(system-controlled — cannot be manually changed)</span>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Invoice number</label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Status
              <span className="ml-2 text-xs text-slate-500">(Sending / Sent / Failed are set by the system)</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              disabled={!canEdit}
              className="w-full rounded-xl border border-sky-200/20 bg-slate-950/70 px-4 py-3 text-sm text-ink outline-none focus:border-accent disabled:opacity-50"
            >
              {EDITABLE_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              {/* Show current system status read-only if applicable */}
              {isSystemControlled && (
                <option value={liveStatus}>{liveStatus}</option>
              )}
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Payment terms</label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Due date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Invoice notes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!canEdit}
          />
        </div>

        {/* Feedback messages */}
        {saveStatus === "success" && (
          <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
            Invoice saved.
          </p>
        )}
        {saveStatus === "error" && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {errorMsg}
          </p>
        )}
        {sendStatus === "success" && (
          <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
            ✓ Invoice sent successfully. Status updated to Sent. Redirecting…
          </p>
        )}
        {sendStatus === "not_approved" && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-400">
            Invoice must be set to <strong>Approved</strong> before it can be sent. Save the status change first.
          </p>
        )}
        {sendStatus === "no_email" && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-400">
            This customer has no billing email on file. Go to Settings → Companies and add one.
          </p>
        )}
        {sendStatus === "error" && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {errorMsg}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {canEdit && (
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          )}

          {canSend && (
            <Button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="bg-cyan-500 text-slate-950 hover:brightness-110"
            >
              {sending ? "Sending…" : "Send invoice email"}
            </Button>
          )}

          {!canSend && liveStatus === "Draft" && isAdmin && (
            <p className="self-center text-xs text-slate-500">
              Set status to <strong className="text-slate-300">Approved</strong> and save before sending.
            </p>
          )}

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
  const cls = map[status] ?? "bg-white/10 text-slate-300";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
