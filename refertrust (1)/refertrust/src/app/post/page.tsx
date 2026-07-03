"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { verifyJdUrl } from "@/lib/validateJd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PostReferral() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string>("");
  const [companyDomain, setCompanyDomain] = useState<string>("");
  const [title, setTitle] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [slots, setSlots] = useState("2");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill "the rest": company comes from the logged-in employee's profile.
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data } = await supabase
        .from("profiles")
        .select("companies(name, domain)")
        .eq("id", user.id)
        .maybeSingle();
      const c = (data as any)?.companies;
      if (c) {
        setCompanyName(c.name);
        setCompanyDomain(c.domain);
      }
    })();
  }, [router]);

  const jdCheck = jdUrl ? verifyJdUrl(jdUrl, companyDomain) : null;

  async function submit() {
    setError("");
    if (!title.trim()) return setError("Add a job title.");
    if (!jdCheck?.ok) return setError(jdCheck?.reason || "Add a valid JD link.");

    setSaving(true);
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: title.trim(),
        jdUrl: jdUrl.trim(),
        slots: Math.max(1, Number(slots) || 1),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push("/feed");
    } else {
      setSaving(false);
      setError(data.error || "Could not post. Try again.");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <button
        onClick={() => router.back()}
        className="mb-4 self-start text-sm text-slate-500"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900">Post Referral</h1>
      <p className="mt-1 text-sm text-slate-500">
        {companyName ? (
          <>
            Posting for <span className="font-semibold text-slate-700">{companyName}</span>.
          </>
        ) : (
          "Loading your company…"
        )}
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Job title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Frontend Engineer (React)"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">JD link</label>
          <Input
            type="url"
            inputMode="url"
            value={jdUrl}
            onChange={(e) => setJdUrl(e.target.value)}
            placeholder="https://careers.company.com/job/123"
          />
          {jdCheck && (
            <div className="mt-2">
              {jdCheck.verified ? (
                <Badge tone="good">✓ {jdCheck.reason}</Badge>
              ) : (
                <Badge tone="ok">{jdCheck.reason}</Badge>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Slots</label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={slots}
            onChange={(e) => setSlots(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-auto pt-8">
        <Button size="lg" onClick={submit} disabled={saving || !companyDomain}>
          {saving ? "Posting…" : "Post Referral"}
        </Button>
      </div>
    </main>
  );
}
