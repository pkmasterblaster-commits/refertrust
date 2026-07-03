import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { referralId } = await request.json().catch(() => ({}));
  if (!referralId) {
    return NextResponse.json({ error: "Missing referral." }, { status: 400 });
  }

  const { data: referral } = await supabase
    .from("referrals")
    .select("id, poster_id, slots, slots_filled, is_active")
    .eq("id", referralId)
    .maybeSingle();

  if (!referral || !referral.is_active) {
    return NextResponse.json({ error: "This referral is no longer available." }, { status: 404 });
  }
  if (referral.poster_id === user.id) {
    return NextResponse.json({ error: "You can't request your own referral." }, { status: 400 });
  }

  // Already requested? Re-open the existing chat instead of duplicating.
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("referral_id", referralId)
    .eq("seeker_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ applicationId: existing.id });
  }

  // V1: request immediately opens a chat with the poster (status "matched").
  // A poster-accept step can be added in V2 without changing this contract.
  const { data, error } = await supabase
    .from("applications")
    .insert({ referral_id: referralId, seeker_id: user.id, status: "matched" })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applicationId: data.id });
}
