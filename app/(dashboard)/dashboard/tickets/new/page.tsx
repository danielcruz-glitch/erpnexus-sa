import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { TicketForm } from "@/components/forms/ticket-form";
import { redirect } from "next/navigation";
export default async function NewTicketPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single(); return <div><Topbar title="Create ticket" subtitle="Fast intake with visible fields and clean ERP support context." /><Card className="max-w-3xl p-6"><TicketForm companyId={profile?.company_id ?? null} userId={user.id} /></Card></div>; }
