import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyJdUrl } from "@/lib/validateJd";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { jobTitle, jdUrl, slots } = await request.json().catch(() => ({}));
  if (!jobTitle || !jdUrl) {
    return NextResponse.json({ error: "Job title and JD link are required." }, { status: 400 });
  }

  // Need the poster's company (auto-fill) to (a) attach the referral and
  // (b) verify the JD link against the company domain.
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, companies(domain)")
    .eq("id", user.id)
    .maybeSingle();

  const companyId = (profile as any)?.company_id;
  const domain = (profile as any)?.companies?.domain as string | undefined;
  if (!companyId) {
    return NextResponse.json({ error: "No company linked to your account." }, { status: 400 });
  }

  const check = verifyJdUrl(jdUrl, domain);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("referrals")
    .insert({
      poster_id: user.id,
      company_id: companyId,
      job_title: jobTitle,
      jd_url: jdUrl,
      slots: Math.max(1, Number(slots) || 1),
      jd_verified: check.verified,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
