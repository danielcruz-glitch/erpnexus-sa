import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateInvoicePdf } from "@/lib/pdf";
import { sendInvoiceEmail } from "@/lib/email";
import type { InvoiceDetail } from "@/lib/types";

export async function POST(request: Request) {
  const admin = createAdminClient();

  // ── 1. Auth: must be Main Account Admin ──────────────────────────────────
  const serverClient = await createClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: profile } = await serverClient
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Only Main Account Admin can send invoices." },
      { status: 403 }
    );
  }

  const { data: userCompany } = await admin
    .from("companies")
    .select("is_main_account")
    .eq("id", profile.company_id ?? "")
    .single();

  if (!userCompany?.is_main_account) {
    return NextResponse.json(
      { error: "Only Main Account Admin can send invoices." },
      { status: 403 }
    );
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let invoiceId: string;
  try {
    const body = (await request.json()) as { invoiceId?: string };
    if (!body.invoiceId) throw new Error("missing");
    invoiceId = body.invoiceId;
  } catch {
    return NextResponse.json({ error: "invoiceId is required." }, { status: 400 });
  }

  // ── 3. Load invoice with full relations ───────────────────────────────────
  const { data: invoiceRaw, error: loadError } = await admin
    .from("invoices")
    .select(
      `*,
       companies!invoices_company_id_fkey(
         id, name, billing_name,
         billing_address_line_1, billing_address_line_2,
         billing_city, billing_state, billing_zip,
         billing_email
       ),
       invoice_items(*)`
    )
    .eq("id", invoiceId)
    .single();

  if (loadError || !invoiceRaw) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const invoice = invoiceRaw as unknown as InvoiceDetail;

  // ── 4. Status guards ──────────────────────────────────────────────────────
  if (invoice.status === "Sent") {
    return NextResponse.json(
      { error: "This invoice has already been sent. Duplicate sends are blocked." },
      { status: 409 }
    );
  }

  if (invoice.status === "Sending") {
    return NextResponse.json(
      { error: "This invoice is currently being sent. Please wait." },
      { status: 409 }
    );
  }

  if (invoice.status !== "Approved") {
    return NextResponse.json(
      {
        error: `Invoice must be in Approved status before sending. Current status: ${invoice.status}.`,
      },
      { status: 422 }
    );
  }

  // ── 5. Validate billing email ─────────────────────────────────────────────
  const billingEmail = invoice.companies?.[0]?.billing_email;
  if (!billingEmail) {
    return NextResponse.json(
      {
        error:
          "Customer has no billing email on file. Go to Settings → Companies and add one before sending.",
      },
      { status: 422 }
    );
  }

  // ── 6. Lock: set status = "Sending" ──────────────────────────────────────
  await admin
    .from("invoices")
    .update({
      status: "Sending",
      email_status: "sending",
      email_error: null,
    })
    .eq("id", invoiceId);

  // ── 7. Generate PDF ───────────────────────────────────────────────────────
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generateInvoicePdf(invoice);
  } catch (pdfErr) {
    const msg = pdfErr instanceof Error ? pdfErr.message : "PDF generation failed.";
    await admin
      .from("invoices")
      .update({ status: "Failed", email_status: "failed", email_error: `PDF error: ${msg}` })
      .eq("id", invoiceId);
    return NextResponse.json({ error: `PDF generation failed: ${msg}` }, { status: 500 });
  }

  // ── 8. Send email via Resend (always CC cruzdaniel004@gmail.com) ──────────
  const emailResult = await sendInvoiceEmail(invoice, billingEmail, pdfBytes);

  if (!emailResult.success) {
    await admin
      .from("invoices")
      .update({
        status: "Failed",
        email_status: "failed",
        email_error: emailResult.error ?? "Unknown email error.",
      })
      .eq("id", invoiceId);

    return NextResponse.json(
      { error: emailResult.error ?? "Failed to send invoice email." },
      { status: 500 }
    );
  }

  // ── 9. Success: mark Sent ─────────────────────────────────────────────────
  const now = new Date().toISOString();
  await admin
    .from("invoices")
    .update({
      status: "Sent",
      sent_at: now,
      email_status: "sent",
      email_sent_at: now,
      email_error: null,
    })
    .eq("id", invoiceId);

  return NextResponse.json({ success: true });
}
