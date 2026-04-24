"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CompanyRow, InvoiceSettingsRow } from "@/lib/types";

type Props = {
  company: CompanyRow;
  invoiceSettings: InvoiceSettingsRow | null;
};

export function CompanySettingsForm({ company, invoiceSettings }: Props) {
  const [name, setName] = useState(company.name ?? "");
  const [billingContact, setBillingContact] = useState(company.billing_contact_name ?? "");
  const [payToName, setPayToName] = useState(invoiceSettings?.pay_to_name ?? "");
  const [paymentTerms, setPaymentTerms] = useState(invoiceSettings?.default_payment_terms_label ?? "Net 30");
  const [address, setAddress] = useState(invoiceSettings?.pay_to_address_line_1 ?? "");
  const [city, setCity] = useState(invoiceSettings?.pay_to_city ?? "");
  const [state, setState] = useState(invoiceSettings?.pay_to_state ?? "");
  const [zip, setZip] = useState(invoiceSettings?.pay_to_zip ?? "");

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSave() {
    setSaving(true);
    setStatus("idle");

    const supabase = createClient();

    // Update company name and billing contact
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name,
        billing_contact_name: billingContact,
      })
      .eq("id", company.id);

    if (companyError) {
      setStatus("error");
      setSaving(false);
      return;
    }

    // Upsert invoice settings
    const settingsPayload = {
      company_id: company.id,
      pay_to_name: payToName,
      default_payment_terms_label: paymentTerms,
      pay_to_address_line_1: address,
      pay_to_city: city,
      pay_to_state: state,
      pay_to_zip: zip,
    };

    const { error: settingsError } = invoiceSettings
      ? await supabase
          .from("invoice_settings")
          .update(settingsPayload)
          .eq("id", invoiceSettings.id)
      : await supabase
          .from("invoice_settings")
          .insert(settingsPayload);

    if (settingsError) {
      setStatus("error");
      setSaving(false);
      return;
    }

    setStatus("success");
    setSaving(false);
  }

  return (
    <Card className="max-w-4xl p-6">
      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Main company name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Billing contact</label>
            <Input value={billingContact} onChange={(e) => setBillingContact(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Remit to name</label>
            <Input value={payToName} onChange={(e) => setPayToName(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Payment terms</label>
            <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Address line 1</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-slate-300">City</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">State</label>
            <Input value={state} onChange={(e) => setState(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">ZIP</label>
            <Input value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
        </div>

        {status === "success" && (
          <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
            Settings saved successfully.
          </p>
        )}

        {status === "error" && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            Failed to save. Check your permissions and try again.
          </p>
        )}

        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save main account settings"}
        </Button>
      </div>
    </Card>
  );
}
