"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Lightweight profile capture that powers the "For You" ranking.
// Kept to 4 fields + skip so it never blocks the core loop.
export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [yoe, setYoe] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(skip = false) {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    await supabase
      .from("profiles")
      .update({
        full_name: skip ? "Member" : name.trim() || "Member",
        skills: skip
          ? []
          : skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
        location: skip ? null : location.trim() || null,
        years_experience: skip || !yoe ? null : Number(yoe),
      })
      .eq("id", user.id);

    router.push("/feed");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-14">
      <h1 className="text-2xl font-bold text-slate-900">Tell us a bit about you</h1>
      <p className="mt-1 text-sm text-slate-500">
        So your feed shows referrals that actually fit. Takes 20 seconds.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Your name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pankaj Kumar" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Skills (comma separated)
          </label>
          <Input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="react, python, product"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Delhi NCR" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Years of experience
          </label>
          <Input
            type="number"
            inputMode="numeric"
            value={yoe}
            onChange={(e) => setYoe(e.target.value)}
            placeholder="3"
          />
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-8">
        <Button size="lg" onClick={() => save(false)} disabled={saving}>
          {saving ? "Saving…" : "Save and continue"}
        </Button>
        <button
          onClick={() => save(true)}
          className="w-full py-2 text-sm text-slate-400 hover:text-slate-600"
        >
          Skip for now
        </button>
      </div>
    </main>
  );
}
