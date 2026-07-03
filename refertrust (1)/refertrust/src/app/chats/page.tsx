import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Minimal list of your conversations (as seeker OR as poster). RLS already
// scopes applications to the current user, so no extra filtering needed.
export default async function Chats() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: apps } = await supabase
    .from("applications")
    .select("id, created_at, referrals(job_title, companies(name))")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-md px-4 pb-10 pt-6">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/feed" className="text-sm text-slate-500">
          ← Feed
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Chats</h1>
      </header>

      {!apps || apps.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">No chats yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Request a referral, or wait for someone to request yours.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {apps.map((a: any) => (
            <Link
              key={a.id}
              href={`/chat/${a.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="font-semibold text-slate-900">
                {a.referrals?.job_title ?? "Referral"}
              </p>
              <p className="text-sm text-slate-500">{a.referrals?.companies?.name ?? ""}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
