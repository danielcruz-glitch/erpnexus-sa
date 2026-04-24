"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { WorkLogApprovalStatus } from "@/lib/types";

type ResolveTicketFormProps = {
  ticketId: string;
  userId: string;
  privileged?: boolean;
};

export function ResolveTicketForm({
  ticketId,
  userId,
  privileged = false,
}: ResolveTicketFormProps) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("1");
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function handleResolve() {
    setSaving(true);

    const supabase = createClient();
    const targetStatus = privileged ? "Pending Invoicing" : "Pending Invoicing Approval";
    const targetApprovalStatus = privileged ? "Pending Invoicing" : "Pending Approval";
    const workLogApprovalStatus: WorkLogApprovalStatus = privileged
      ? "Approved"
      : "Pending Approval";

    const ticketUpdate = supabase
      .from("tickets")
      .update({
        status: targetStatus,
        resolution_note: description,
        work_completed_on: workDate,
        invoice_approval_status: targetApprovalStatus,
        approved_at: privileged ? new Date().toISOString() : null,
        approved_by: privileged ? userId : null,
      })
      .eq("id", ticketId);

    const logInsert = supabase.from("work_logs").insert({
      ticket_id: ticketId,
      user_id: userId,
      work_date: workDate,
      work_completed_on: workDate,
      hours_worked: Number(hours),
      notes: description,
      invoice_line_description: description,
      billable: true,
      approval_status: workLogApprovalStatus,
    });

    const [{ error: ticketError }, { error: logError }] = await Promise.all([
      ticketUpdate,
      logInsert,
    ]);

    setSaving(false);

    if (!ticketError && !logError) {
      router.push("/dashboard/tickets");
      router.refresh();
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <label className="mb-2 block text-sm text-slate-300">Describe work performed</label>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Explained root cause, corrected posting setup, retested invoice flow."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Hours worked</label>
          <Input
            type="number"
            min="0.25"
            step="0.25"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Date work completed</label>
          <Input
            type="date"
            value={workDate}
            onChange={(event) => setWorkDate(event.target.value)}
          />
        </div>
      </div>

      <Button type="button" onClick={handleResolve} disabled={saving || !description.trim()}>
        {privileged ? "Approve and move to invoicing" : "Resolve and send for approval"}
      </Button>
    </div>
  );
}
