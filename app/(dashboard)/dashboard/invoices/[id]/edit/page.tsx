import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import { InvoiceEditForm } from "@/components/forms/invoice-edit-form";
import type { InvoiceRow } from "@/lib/types";

type EditInvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to load invoice for editing: ${error.message}`);
  }

  return (
    <div>
      <Topbar
        title="Edit invoice"
        subtitle="Admin-only invoice refinement page for clean, final billing output."
      />
      <InvoiceEditForm invoice={data as InvoiceRow} />
    </div>
  );
}
