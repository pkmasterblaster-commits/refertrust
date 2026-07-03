import { createClient as createAdmin } from "@supabase/supabase-js";
import { LIMITS } from "@/lib/constants";

export const dynamic = "force-dynamic";

// Reads real usage server-side with the service-role key (never sent to client).
async function getUsage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const admin = createAdmin(url, key, { auth: { persistSession: false } });

  // db_size_mb() and user_count() are defined in supabase/schema.sql.
  const [{ data: sizeMb }, { count }] = await Promise.all([
    admin.rpc("db_size_mb"),
    admin.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return {
    dbMB: typeof sizeMb === "number" ? sizeMb : null,
    users: count ?? 0,
  };
}

function Meter({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number | null;
  limit: number;
  unit: string;
}) {
  const pct = used == null ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const warn = pct >= LIMITS.warnAtPercent;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={warn ? "text-sm font-bold text-red-600" : "text-sm text-slate-500"}>
          {used == null ? "—" : used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={warn ? "h-full bg-red-500" : "h-full bg-brand"}
          style={{ width: `${pct}%` }}
        />
      </div>
      {warn && (
        <p className="mt-2 text-xs font-medium text-red-600">
          Over {LIMITS.warnAtPercent}%. Plan an upgrade or clean up before it fills.
        </p>
      )}
    </div>
  );
}

export default async function StatusPage() {
  const usage = await getUsage();

  return (
    <main className="mx-auto max-w-md px-4 pb-10 pt-6">
      <h1 className="text-xl font-bold text-slate-900">System status</h1>
      <p className="mt-1 text-sm text-slate-500">Free-tier usage across Supabase and Vercel.</p>

      {usage == null ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Service-role key not set. Add SUPABASE_SERVICE_ROLE_KEY to see live usage.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <Meter label="Database storage" used={usage.dbMB} limit={LIMITS.supabaseDbMB} unit="MB" />
          <Meter label="Users" used={usage.users} limit={LIMITS.supabaseUsers} unit="users" />
          <Meter
            label="Bandwidth (manual)"
            used={null}
            limit={LIMITS.vercelBandwidthGB}
            unit="GB"
          />
          <p className="text-xs text-slate-400">
            Bandwidth needs a Vercel API token to read automatically — check it in the Vercel
            dashboard for now.
          </p>
        </div>
      )}
    </main>
  );
}
