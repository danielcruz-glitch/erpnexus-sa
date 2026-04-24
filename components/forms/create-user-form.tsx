"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";

type Company = { id: string; name: string };

type Props = { companies: Company[] };

const ROLE_OPTIONS: Role[] = ["admin", "support", "client_admin", "user"];

export function CreateUserForm({ companies }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleCreate() {
    if (!fullName || !email || !password) return;
    setSaving(true);
    setStatus("idle");
    setErrorMsg("");

    // Call a server action via API route to create the auth user + profile
    const res = await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, role, companyId }),
    });

    const json = await res.json() as { error?: string };
    setSaving(false);

    if (!res.ok) {
      setStatus("error");
      setErrorMsg(json.error ?? "Failed to create user.");
      return;
    }

    setStatus("success");
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("user");
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Full name</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-xl border border-sky-200/20 bg-slate-950/70 px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Company</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full rounded-xl border border-sky-200/20 bg-slate-950/70 px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {status === "success" && (
        <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
          User created successfully. They can now sign in.
        </p>
      )}
      {status === "error" && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {errorMsg}
        </p>
      )}

      <div>
        <Button
          type="button"
          onClick={handleCreate}
          disabled={saving || !fullName || !email || !password}
        >
          {saving ? "Creating..." : "Create user"}
        </Button>
      </div>
    </div>
  );
}
