import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Records a report against a referral. In V1 an admin later confirms whether the
// report itself is fake; if so, applyFakeReportPenalty (-50) is run on the
// reporter's trust_score (see /lib/trustScore.ts). No auto-penalty here so a
// single click can't tank someone's score.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { referralId, reason } = await request.json().catch(() => ({}));
  if (!referralId) return NextResponse.json({ error: "Missing referral." }, { status: 400 });

  const { error } = await supabase.from("reports").insert({
    referral_id: referralId,
    reporter_id: user.id,
    reason: reason ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
