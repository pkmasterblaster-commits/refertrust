import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rankReferrals } from "@/lib/rankFeed";
import { ReferralCard } from "@/components/ReferralCard";
import type { Profile, ReferralWithCompany } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Feed() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: referrals } = await supabase
    .from("referrals")
    .select("*, companies(id, name, domain, logo_url)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const ranked = rankReferrals(
    (referrals as ReferralWithCompany[]) ?? [],
    (profile as Profile) ?? null
  );

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand">ReferTrust</div>
          <h1 className="text-xl font-bold text-slate-900">For You</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/chats" className="text-sm font-semibold text-brand">
            Chats
          </Link>
          <Link
            href="/admin/status"
            className="text-xs text-slate-400 underline underline-offset-2"
          >
            status
          </Link>
        </div>
      </header>

      {ranked.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-base font-semibold text-slate-900">No referrals yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Be the first to post from your company.
          </p>
          <Link href="/post" className="mt-4 inline-block font-semibold text-brand">
            Post a referral →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map((ref) => (
            <ReferralCard
              key={ref.id}
              referral={ref}
              isSeeker={ref.poster_id !== user.id}
            />
          ))}
        </div>
      )}

      {/* One always-visible action: post a referral. */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md px-4 pb-5">
        <Link href="/post">
          <span className="flex h-14 w-full items-center justify-center rounded-xl bg-brand text-base font-semibold text-white shadow-lg shadow-brand/30 active:scale-[0.99]">
            + Post Referral
          </span>
        </Link>
      </div>
    </div>
  );
}
