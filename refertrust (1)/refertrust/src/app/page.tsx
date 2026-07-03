import Link from "next/link";
import { Button } from "@/components/ui/button";

// The whole page has one job: a first-time visitor should understand
// "employees post referral slots, seekers request them" in ~10 seconds.
export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-16">
      <div className="mb-2 text-sm font-semibold tracking-wide text-brand">ReferTrust</div>

      <h1 className="text-4xl font-extrabold leading-tight text-slate-900">
        Get referred,
        <br />
        not ignored.
      </h1>

      <p className="mt-4 text-lg text-slate-600">
        Real employees post referral slots at their company. You request one. You chat.
        That's the whole thing.
      </p>

      {/* 3-step "how it works" — order carries meaning, so numbering is honest here */}
      <ol className="mt-8 space-y-4">
        {[
          ["1", "Employees post a referral", "Job title, JD link, how many slots. 30 seconds."],
          ["2", "You find one for you", 'A "For You" feed ranked to your skills.'],
          ["3", "Tap Request, then chat", "Matched employee replies in-app."],
        ].map(([n, title, body]) => (
          <li key={n} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {n}
            </span>
            <div>
              <p className="font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-auto pt-10">
        <Link href="/login">
          <Button size="lg">Get started</Button>
        </Link>
        <p className="mt-3 text-center text-xs text-slate-400">
          Company email only. Keeps referrals real.
        </p>
      </div>
    </main>
  );
}
