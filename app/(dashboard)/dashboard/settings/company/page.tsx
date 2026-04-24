import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import type { CompanyRow, InvoiceSettingsRow } from "@/lib/types";
import { CompanySettingsForm } from "@/components/forms/company-settings-form";

export default async function CompanySettingsPage() {
  const supabase = createAdminClient();

  const [companyResult, settingsResult] = await Promise.all([
    supabase.from("companies").select("*").eq("is_main_account", true).single(),
    supabase.from("invoice_settings").select("*").limit(1).maybeSingle(),
  ]);

  if (companyResult.error) {
    throw new Error(`Failed to load main company: ${companyResult.error.message}`);
  }

  if (settingsResult.error) {
    throw new Error(`Failed to load invoice settings: ${settingsResult.error.message}`);
  }

  const company = companyResult.data as CompanyRow;
  const invoiceSettings = settingsResult.data as InvoiceSettingsRow | null;

  return (
    <div>
      <Topbar
        title="Main Account setup"
        subtitle="Define ERPNexus remit-to details, default terms, and billing identity."
      />
      <CompanySettingsForm company={company} invoiceSettings={invoiceSettings} />
    </div>
  );
}
