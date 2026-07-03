"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BLOCKED_EMAIL_DOMAINS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function sendLink() {
    setError("");
    const clean = email.trim().toLowerCase();
    const domain = clean.split("@")[1];

    if (!domain || !clean.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
      setError("Please use your work email, not a personal one. This keeps referrals real.");
      return;
    }

    setState("loading");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: clean,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      setState("error");
      setError(authError.message);
    } else {
      setState("sent");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="mb-2 text-sm font-semibold text-brand">ReferTrust</div>
      <h1 className="text-2xl font-bold text-slate-900">Sign in with work email</h1>
      <p className="mt-1 text-sm text-slate-500">
        We'll email you a magic link. No password.
      </p>

      {state === "sent" ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-800">Check your inbox</p>
          <p className="mt-1 text-sm text-emerald-700">
            We sent a link to <span className="font-medium">{email}</span>. Open it on this
            phone to continue.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendLink()}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button size="lg" onClick={sendLink} disabled={state === "loading"}>
            {state === "loading" ? "Sending…" : "Send magic link"}
          </Button>
        </div>
      )}
    </main>
  );
}
