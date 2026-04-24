"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { TicketPriority } from "@/lib/types";

type TicketFormProps = {
  companyId?: string | null;
  userId: string;
};

const PRIORITY_OPTIONS: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];

export function TicketForm({ companyId, userId }: TicketFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from("tickets").insert({
      ticket_number: `T-${Date.now()}`,
      title,
      description,
      priority,
      status: "New",
      user_id: userId,
      company_id: companyId ?? null,
    });

    setSubmitting(false);

    if (!error) {
      router.push("/dashboard/tickets");
      router.refresh();
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <label className="mb-2 block text-sm text-slate-300">Ticket title</label>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Epicor invoice posting error"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Priority</label>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as TicketPriority)}
          className="w-full rounded-xl border border-sky-200/20 bg-slate-950/70 px-4 py-3 text-sm text-ink outline-none focus:border-accent"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Description</label>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the issue, business impact, and any exact error text."
        />
      </div>

      <Button
        type="button"
        disabled={submitting || !title.trim() || !description.trim()}
        onClick={handleSubmit}
      >
        Create ticket
      </Button>
    </div>
  );
}
