"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReferralWithCompany } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ReferralCard({
  referral,
  isSeeker,
}: {
  referral: ReferralWithCompany;
  isSeeker: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "requested" | "error">("idle");
  const [msg, setMsg] = useState("");

  const company = referral.companies;
  const slotsLeft = referral.slots - referral.slots_filled;

  async function requestReferral() {
    setState("loading");
    setMsg("");
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralId: referral.id }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.applicationId) {
      setState("requested");
      router.push(`/chat/${data.applicationId}`);
    } else {
      setState("error");
      setMsg(data.error || "Could not send request. Try again.");
    }
  }

  async function report() {
    if (!confirm("Report this referral as fake or misleading?")) return;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralId: referral.id }),
    });
    setMsg("Reported. Our team will review it.");
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">
          {company ? initials(company.name) : "•"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">
            {referral.job_title}
          </p>
          <p className="truncate text-sm text-slate-500">{company?.name ?? "Company"}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {referral.jd_verified ? (
          <Badge tone="good">✓ Verified JD</Badge>
        ) : (
          <Badge tone="ok">Unverified JD</Badge>
        )}
        <Badge tone="brand">{slotsLeft > 0 ? `${slotsLeft} slots left` : "Full"}</Badge>
        <a
          href={referral.jd_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-brand underline underline-offset-2"
        >
          View job
        </a>
      </div>

      {isSeeker && (
        <div className="mt-4">
          <Button
            size="lg"
            onClick={requestReferral}
            disabled={state === "loading" || state === "requested" || slotsLeft <= 0}
          >
            {state === "loading"
              ? "Sending…"
              : state === "requested"
                ? "Request sent ✓"
                : "Request Referral"}
          </Button>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        {msg ? (
          <p className={state === "error" ? "text-xs text-red-600" : "text-xs text-slate-500"}>
            {msg}
          </p>
        ) : (
          <span />
        )}
        <button
          onClick={report}
          className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600"
        >
          Report
        </button>
      </div>
    </div>
  );
}
