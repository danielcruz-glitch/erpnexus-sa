"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/layout/brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    // Always show success — don't reveal whether the email exists
    setSent(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <Card className="p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Check your email</h2>
              <p className="mt-3 text-sm text-slate-300">
                If an account exists for <span className="text-white">{email}</span>, you'll
                receive a password reset link shortly.
              </p>
              <a href="/login" className="mt-6 block text-sm text-accent hover:underline">
                Back to sign in
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white">Reset your password</h2>
              <p className="mt-2 text-sm text-slate-300">
                Enter your email and we'll send you a reset link.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Work email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !email}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </Button>

                <a href="/login" className="block text-center text-sm text-slate-400 hover:text-slate-300">
                  Back to sign in
                </a>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
