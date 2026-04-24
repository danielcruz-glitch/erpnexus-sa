import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResolveTicketForm } from "@/components/forms/resolve-ticket-form";
import { formatDate } from "@/lib/utils";
import type { Role, TicketDetail } from "@/lib/types";

type TicketDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile, error: profileError }, { data: ticket, error: ticketError }] =
    await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase
        .from("tickets")
        .select("*, companies(id,name), profiles(full_name)")
        .eq("id", id)
        .single(),
    ]);

  if (profileError) {
    throw new Error(`Failed to load profile: ${profileError.message}`);
  }

  if (ticketError) {
    throw new Error(`Failed to load ticket: ${ticketError.message}`);
  }

  const typedTicket = ticket as TicketDetail;
  const role = profile?.role as Role | undefined;
  const privileged = role === "admin" || role === "support";

  return (
    <div>
      <Topbar
        title={typedTicket.ticket_number}
        subtitle="View detail, resolve work, and move the ticket into invoice flow."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-white">{typedTicket.title}</h2>
            <Badge>{typedTicket.status}</Badge>
          </div>

          <dl className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-400">Company</dt>
              <dd className="mt-1 text-slate-100">
                {typedTicket.companies?.[0]?.name ?? "Unassigned"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Submitted by</dt>
              <dd className="mt-1 text-slate-100">
                {typedTicket.profiles?.[0]?.full_name ?? "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Created</dt>
              <dd className="mt-1 text-slate-100">{formatDate(typedTicket.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Priority</dt>
              <dd className="mt-1 text-slate-100">{typedTicket.priority}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <h3 className="text-sm uppercase tracking-[0.22em] text-cyan-200">Issue detail</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {typedTicket.description}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white">Resolve ticket</h3>
          <p className="mt-2 text-sm text-slate-300">
            Users can resolve and send for approval. Main Support and Main Admin can
            approve directly into pending invoicing.
          </p>
          <div className="mt-6">
            <ResolveTicketForm ticketId={id} userId={user.id} privileged={privileged} />
          </div>
        </Card>
      </div>
    </div>
  );
}
