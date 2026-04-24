import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CompanyRow, InvoiceSettingsRow } from "@/lib/types";

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

      <Card className="max-w-4xl p-6">
        <form className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Main company name</label>
              <Input defaultValue={company.name} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Billing contact</label>
              <Input defaultValue={company.billing_contact_name ?? ""} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Remit to name</label>
              <Input defaultValue={invoiceSettings?.pay_to_name ?? "Accounts Receivable"} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Payment terms</label>
              <Input defaultValue={invoiceSettings?.default_payment_terms_label ?? "Net 30"} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Address line 1</label>
            <Input defaultValue={invoiceSettings?.pay_to_address_line_1 ?? ""} />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-slate-300">City</label>
              <Input defaultValue={invoiceSettings?.pay_to_city ?? ""} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">State</label>
              <Input defaultValue={invoiceSettings?.pay_to_state ?? ""} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">ZIP</label>
              <Input defaultValue={invoiceSettings?.pay_to_zip ?? ""} />
            </div>
          </div>

          <Button type="button">Save main account settings</Button>
        </form>
      </Card>
    </div>
  );
}
