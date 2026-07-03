import type { ReferralWithCompany, Profile } from "./types";

// "For You" ranking (V1, simple + explainable).
// Score = skill overlap (title/skills) + location match + trust of poster.
// No ML — a 12th-pass user should be able to guess why something ranked high.
export function scoreReferral(ref: ReferralWithCompany, profile: Profile | null): number {
  if (!profile) return ref.jd_verified ? 1 : 0; // logged-out / no profile: verified first

  let score = 0;
  const title = ref.job_title.toLowerCase();

  // Skill / title keyword overlap (max 6 pts)
  const skills = (profile.skills || []).map((s) => s.toLowerCase());
  for (const skill of skills) {
    if (skill && title.includes(skill)) score += 2;
  }
  score = Math.min(score, 6);

  // Location match (2 pts) — company city vs seeker location is coarse in V1,
  // so we reward same-word location hits in the title (e.g. "Remote", city name).
  if (profile.location) {
    const loc = profile.location.toLowerCase();
    if (title.includes(loc) || title.includes("remote")) score += 2;
  }

  // Verified JD gets a small bump (1 pt) — authenticity matters.
  if (ref.jd_verified) score += 1;

  // Higher-trust posters rank a touch higher (up to 1 pt).
  const trust = ref.poster_trust ?? 100;
  score += trust >= 80 ? 1 : 0;

  return score;
}

export function rankReferrals(
  refs: ReferralWithCompany[],
  profile: Profile | null
): ReferralWithCompany[] {
  return [...refs].sort((a, b) => {
    const diff = scoreReferral(b, profile) - scoreReferral(a, profile);
    if (diff !== 0) return diff;
    // Tie-break: newest first.
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
