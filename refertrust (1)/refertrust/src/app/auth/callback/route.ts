import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the magic-link redirect: exchanges the code for a session, then makes
// sure the user has a profile row and is linked to their company (auto-created
// from the email domain if we haven't seen it before).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const domain = user.email.split("@")[1].toLowerCase();

    // Find or create the company for this domain.
    let { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("domain", domain)
      .maybeSingle();

    if (!company) {
      const root = domain.split(".")[0];
      const name = root.charAt(0).toUpperCase() + root.slice(1);
      const { data: created } = await supabase
        .from("companies")
        .insert({ name, domain })
        .select("id")
        .single();
      company = created ?? null;
    }

    // Create profile if it doesn't exist yet.
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        company_id: company?.id ?? null,
        role: "seeker",
      });
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    if (!profile.full_name) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/feed`);
}
