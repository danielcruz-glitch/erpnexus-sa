"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function LoginForm() { const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false); async function handleLogin() { setLoading(true); setMessage(""); const supabase = createClient(); const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } }); setLoading(false); setMessage(error ? error.message : "Magic link sent. Check your email."); } return <div className="space-y-4"><div><label className="mb-2 block text-sm text-slate-300">Work email</label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div><Button type="button" onClick={handleLogin} disabled={loading || !email} className="w-full">{loading ? "Sending..." : "Send secure sign-in link"}</Button>{message ? <p className="text-sm text-slate-300">{message}</p> : null}</div>; }
